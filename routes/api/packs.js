const router = require("express").Router();
const fetch = require("node-fetch");
let Pack = require("../../schemas/packSchema");
let User = require("../../schemas/userSchema");
const http = require("http");
const fs = require("fs");
const auth = require("../../middleware/auth")
const sanitize = require("mongo-sanitize");

const uploadFile = require("./uploadFile.js")

//Anything to do with packs be that opening, adding new packs, or changing a packs properties is in here

//The API is restricted to displaying 100 cards at a time so i made a function to make multiple calls to the API and go through each page until there are no cards left
async function loopThroughPackPages(json, packIndex){
        page = 1;
        cardsArray = []

        //Loops 10 times because the APi displays 100 cards at a time
        //So looping over 100 times should cover any pokemon set that exists... you would hope
        for (let i = 0; i < 100; i++){
            //Retrieve all the cards from a given set
            //Fetch the speicifc set id
            //Await was needed to stop the for loop sending another fetch request before this one was done
            //Without this is lead to image corruption and sometimes just no requesting at all
            await fetch("https://api.pokemontcg.io/v1/cards?setCode=" + json.sets[packIndex].code + "&page=" + page, {method: "GET"})
            .then(async res => res.json())
            .then(async res => {
                //Itterate though all the cards in the set and save the image, similar to saving the set logos above
                for (let i = 0; i < res.cards.length; i++){
                    await fetch(res.cards[i].imageUrl)
                    .then(resImg => {
                            uploadFile.uploadToS3("packs/" + json.sets[packIndex].code + "/" +  res.cards[i].id + ".jpg", resImg.body)
                            .then(data => {
                                //Set the URL to the S3 bucket
                                res.cards[i].myImageUrl = data.Location
                                cardsArray.push(res.cards[i]);
                            })
                            
                    })
                }

                if (res.cards.length == 100){
                    page += 1;
                } else {
                    i = 100;
                }
            });
        }

        return cardsArray;
}

//Get request to check if a pack exists in the database with its properties set and return it
router.get("/:packCode/", (req, res) => {
    let packCode = sanitize(req.params.packCode);
    Pack.findOne({"code": packCode, "propertiesAreSet": true}, (err,data) => {
        if (err){
            res.status(400).json("Error: " + err);
            return;
        } else {
            //Found pack in database
            if (data){
                res.status(200).json(data);
            } 
            else {
                res.status(404).json({})
            }
        }
    });
})

//Set the properties of a pack in the database
router.post("/setproperties/:packCode/", auth, (req, res) => {
    fetch("http://localhost:5000/api/auth/user", {method: "GET", headers:{"accepts": "application/json", "Content-Type": "application/json", "x-auth-token": req.header("x-auth-token")}})
    .then(res => res.json())
    .then(json => {
        if (json.admin){
            let packCode = sanitize(req.params.packCode)
            Pack.findOne({"code": packCode}, (err,data) => {
                if (err){
                    res.status(400).json("Error: " + err);
                    return;
                } else {
                    //Found pack in database

                    //Defining the actual odds and also the odds values
                    //Total is used to ensure everything adds up to 100
                    let rarityOdds = {}
                    let total = 0
                    for (var key in req.body){
                        
                        if (req.body.hasOwnProperty(key)){
                            //Do not inclue the cost with the odds
                            if (key == "cost"){
                                if (isNaN(req.body[key])){
                                    res.status(400).json({
                                        msg: "Cost is not a valid number"
                                    });
                                    return
                                } else {
                                    data.cost = req.body[key];
                                } 
                            } 
                            else if (key == "level"){
                                if (isNaN(req.body[key])){
                                    res.status(400).json({
                                        msg: "Level is not a valid number"
                                    });
                                    return
                                } else {
                                    data.level = req.body[key];
                                }
                            }
                            //Everything that is not the cost gets added to the rarityOdds object and the total is incremented by the odds value
                            else {
                                if (isNaN(req.body[key])){
                                    res.status(400).json({
                                        msg: "A rarity value is not a valid number"
                                    });
                                    return
                                } else {
                                    rarityOdds[key] = req.body[key]
                                    total += parseFloat(req.body[key])
                                    total = Number(total.toFixed(2))
                                }
                            }
                        }
                    }

                    if (total == 100 && data.cost > 0 && data.level > 0){

                        //Add the key value pairs from the object into an array so it can be sorted
                        let tempArray = []
                        for (var key in rarityOdds){
                            if (rarityOdds.hasOwnProperty(key)){
                                tempArray.push([key, rarityOdds[key]])
                            }
                        }

                        //Sort function on the array of arrays
                        tempArray.sort(function(a,b) {
                            return b[1] - a[1];
                        })

                        //Converting array back into a json object
                        let sortedOdds = {}
                        tempArray.forEach(pair => {
                            sortedOdds[pair[0]] = pair[1]
                        })

                        //Set the sorted odds to the packs odds
                        data.rarityOdds = sortedOdds

                        data.propertiesAreSet = true

                        res.status(200).json({
                            msg: "Properties Updated. Will Require A Refresh To Show On Clientside"
                        });

                        //Save the object
                        data.save()
                    } else {
                        res.status(400).json({
                            msg: "Rarity Odds Do Not Total Up To 100 Or Some Properties Were Not Set"
                        });
                    }

                    



                }
            });
        } else {
            res.status(403).json({
                msg: "You Do Not Have Authorization To Perform This Action"
            });
        }
    })
})

//Get request to check if a pack exists in the database, if it does not it will be requested from the API
router.get("/addpack/:packCode/", auth, (req, res) => {
    fetch("http://localhost:5000/api/auth/user", {method: "GET", headers:{"accepts": "application/json", "Content-Type": "application/json", "x-auth-token": req.header("x-auth-token")}})
    .then(res => res.json())
    .then(json => {
        if (json.admin){
            let packCode = sanitize(req.params.packCode)
            Pack.findOne({"code": packCode}, (err,data) => {
                //General error
                if (err){
                    res.status(400).json("Error: " + err);
                    return;
                } else {
                    //Found pack in database
                    if (data){
                        res.status(200).json({msg: "Set Already In Database"});
                    } 
                    //Ping api to get the set from
                    else {
                        //Fetch all sets from the API to find the one with the ID we want, sadly there is no API call to get a pack of a specific ID that includes enough information for what i need, i.e. the image URL's
                        fetch("https://api.pokemontcg.io/v1/sets")
                        .then(res => res.json())
                        .then(json => {
                            let rarities = [];
                            //Loop over all packs and check the ID of the mto try and find the one we need
                            var foundPack = false;
                            var packIndex = 0;
                            for (var i = 0; i < json.sets.length; i++){
                                if (json.sets[i].code == req.params.packCode){
                                    foundPack = true;
                                    packIndex = i;
                                    break;
                                }
                            }
                            //If the pack is found
                            if (foundPack){
        
                                let symbolUrl = "";
                                let logoUrl = "";
        
                                //Two fetch requests are sent to get their images which are then stored locally on the server to be displayed later
                                //I was going to save them to the MongoDB but a few sources said that was not really a common thing to do and is better to save it locally to the server
                                fetch(json.sets[packIndex].logoUrl)
                                .then(async res => {
                                    uploadFile.uploadToS3("packs/" + json.sets[packIndex].code + "/" +  json.sets[packIndex].code + "Logo.jpg", res.body)
                                    .then(data => {
                                        logoUrl = data.Location;
                                    })
        
                                })
        
                                fetch(json.sets[packIndex].symbolUrl)
                                .then(async res => {
                                    uploadFile.uploadToS3("packs/" + json.sets[packIndex].code + "/" +  json.sets[packIndex].code + "Symbol.jpg", res.body)
                                    .then(data => {
                                        symbolUrl = data.Location;
                                    })
                                    
                                })
        
        
                                loopThroughPackPages(json, packIndex)
                                .then(cardsArray => {
                                    for (let i = 0; i < cardsArray.length; i++){
                                        if (!rarities.includes(cardsArray[i].rarity)){
                                            if (cardsArray[i].rarity.length < 1){
                                                res.status(500).json({msg: "Pack Rarities From API Are Incorrect, Sorry. Please Try Another Pack"});
                                                return
                                            }
                                            rarities.push(cardsArray[i].rarity);
                                        }
                                    }

                                    let rarityObject = {}

                                    for (let i = 0; i < rarities.length; i++){
                                        rarityObject[rarities[i]] = 0
                                    }

                                    //Create the pack entry to go into the database, including the cards
                                    let packEntry = new Pack({
                                        code: json.sets[packIndex].code,
                                        ptcgoCode: json.sets[packIndex].ptcgoCode,
                                        name: json.sets[packIndex].name,
                                        series: json.sets[packIndex].series,
                                        totalCards: json.sets[packIndex].totalCards,
                                        standardLegal: json.sets[packIndex].standardLegal,
                                        expandedLegal: json.sets[packIndex].expandedLegal,
                                        releaseDate: json.sets[packIndex].releaseDate,
                                        symbolUrl: json.sets[packIndex].symbolUrl,
                                        mySymbolUrl: symbolUrl,
                                        logoUrl: json.sets[packIndex].logoUrl,
                                        myLogoUrl: logoUrl,
                                        updatedAt: json.sets[packIndex].updatedAt,
                                        cost: 0,
                                        rarityOdds: rarityObject,
                                        cards: cardsArray,
                                    })
                
                                        packEntry.save();
                                        res.status(200).json({
                                            msg: "Set added to database",
                                            rarities: rarities,
                                        });
                                    })
        
                                    
                            } else {
                                //Error if the pack could not be found with the API
                                res.status(404).json({msg: "Could Not Find Pack"});
                            }
                        });
                        
                    }
                }  
            })
        } else {
            res.status(403).json({msg: "You Do Not Have Authorization To Perform This Action"});
        }
        
        
    });
})

//Find all packs in database that have their properties set, using a query paramater to find packs even if their properties are not set
router.get("/", (req, res) => {
    if (req.query.allPacks == "true"){
        fetch("http://localhost:5000/api/auth/user", {method: "GET", headers:{"accepts": "application/json", "Content-Type": "application/json", "x-auth-token": req.header("x-auth-token")}})
        .then(res => res.json())
        .then(json => {
            if (json.admin){
                Pack.find({})
                .select("-cards")
                .then(data => {
                    let returnJson = {
                        packs: []
                    };
                    data.forEach((pack) => {
                        returnJson.packs.push(pack);
                    })
                    res.send(returnJson);
                    return; 
                })
            } else {
                res.status(403).json({msg: "You Do Not Have The Credentials To Perform This Action"});
            }
        })
    } else {
        Pack.find({"propertiesAreSet": true})
        .select("-cards")
        .then(data => {
            let returnJson = {
                packs: []
            };
            data.forEach((pack) => {
                returnJson.packs.push(pack);
            })
            res.send(returnJson);
            return; 
        })
    }

    
})




//API Route to open a pack
let currentlyOpenUsers = []
router.route("/open/:packCode").get((req, res) => {
    //An array was implemented so that the same person could not open more than one pack at a time while their previous request was still being processed as this would lead to a lot of errors with mongo DB data being over written
    //Using this system ensured one user could only have one request being processed at any one time
    if (!currentlyOpenUsers.includes(req.header("x-auth-token"))){
        currentlyOpenUsers.push(req.header("x-auth-token"));
        
        //Find the pack in the database with that code
        let packCode = sanitize(req.params.packCode);
        Pack.findOne({"code": packCode, "propertiesAreSet": true})
        .lean()
        .then(pack => {
            //Fetch the user that is opening the pack so that their inventory can be updated
            fetch("http://localhost:5000/api/auth/user", {method: "GET", headers:{"accepts": "application/json", "Content-Type": "application/json", "x-auth-token": req.header("x-auth-token")}})
            .then(res => res.json())
            .then(json => {
                let cardsPulled = [];
                User.findOne({"_id": json._id})
                .select("money level")
                .then(user => {
                    if (user){
                        //Ensure the user can open the pack
                        if (user.level < pack.level){
                            res.status(400).json({error: "You Do Not Have The Required Level To Buy This Pack"})
                            return
                        }
                        let cost = 10;
                        if (pack.cost) {
                            cost = pack.cost;
                        } 

                        //Deduct money from the user
                        if (user.money - cost >= 0){


                            user.money -= cost;
                            let rarityOddsNames = []
                            let rarityOddsValues = []
                            //Append all of the raritys to arrays so they can be processed
                            for (var key in pack.rarityOdds){
                                if (pack.rarityOdds.hasOwnProperty){
                                    rarityOddsNames.push(key);
                                    rarityOddsValues.push(pack.rarityOdds[key]);
                                }
                            }

                            //The user recieves 3 cards to the loop itterates 3 times
                            for (let i = 0; i < 3; i++){
                                let cardRarityToPull = "";
                                //random number is selected between 0 and 100
                                let rndNumberCardRarity = Math.random() * 100;
                                for (let i = 0; rarityOddsValues.length; i++){
                                    //if the random number is less than the rarity odd at position i in the array then that is the rarity that will be pulled
                                    //For example if a random number of 23 is chosen and the "Holo" rarity has a rarity of 34 then a holo card will be chosen
                                    if (rndNumberCardRarity < rarityOddsValues[i]){
                                        
                                        cardRarityToPull = rarityOddsNames[i]
                                        break;
                                    } 
                                    //if it is not less then the randomly generated number has the rarity odd value at index i taken away
                                    //This is a well known technique used in many video games to implement a tiered loot system with diffrent rarities
                                    else {
                                        rndNumberCardRarity -= rarityOddsValues[i]
                                    }
                                }

                                console.log(cardRarityToPull)

                                //Next a random card of the selected random rarity is chosen to be the card the user will recieve
                                let rndNumber = Math.floor(Math.random() * pack.cards.length);

                                while (pack.cards[rndNumber].rarity != cardRarityToPull){
                                    rndNumber = Math.floor(Math.random() * pack.cards.length);
                                }

                                cardsPulled.push(pack.cards[rndNumber]);
                            }

                            //Users new balance after opening the pack is saved
                            user.save()

                            //The cards the user recieved is shown in the response
                            res.status(200).json(cardsPulled);

                        } else {
                            res.status(400).json({msg: "Not enough money"})
                            return;
                        }
                    }
                })
                //After it has been decided which cards the user will recieve it is time to add those cards to their inventory
                //The reason this was not performed above was to improve the response speed since accessing the users inventory is a slow database operation i felt it better to respond to the user showing them which cards they got so they can carry on using the program while their inventory is updated in the background.
                .then(() => {

                    //Find user based on their ID
                    //Used to add the pack to the users invetory if they have never opened it before
                    User.findOne({"_id": json._id})
                    .select({"inventory": {$elemMatch: {code: pack.code}}})
                    .then(async user => {

                        //Check if the user already has this pack in their database
                        //If they do not, add it
                        if (user.inventory.length > 0){

                        } else {
                            await User.updateOne(
                                {"_id": json._id},
                                {$push: {"inventory": {code: pack.code, cards: []}}}
                            );
                        }
                    })
                    //Find user and then retrieve just their inventory to speed up access time
                    .then(() => {
                        User.findOne({"_id": json._id})
                    .select({"inventory": {$elemMatch: {code: pack.code}}})
                    .then(async user => {
                        //Find the index of the correct pack the cards were opened from
                        let inventoryPackIndex = 0;
                        for (let i = 0; i < user.inventory.length; i++){
                            if (user.inventory[i].code == pack.code){
                                inventoryPackIndex = i;
                            }
                        }

                        //Copy the entire users iventory and eddit that copy
                        let copyInventory = user.inventory[inventoryPackIndex].cards;
                        for (let i = 0; i < cardsPulled.length; i++){
                            //Boolean used to see if a duplicate card is recived. 
                            //This allows the stacking of cards for example a user can be shown that they have x5 gyrados
                            //But mainly limits the inventory size bloating in the database as instead of storing a whole new card +1 can just be added to the quantity of cards the user already has
                            let foundDuplicate = false;
                            //itterate through entire inventory
                            for (let y = 0; y < copyInventory.length; y++){
                                //console.log(copyInventory[y].id + " : " + cardsPulled[i].id);
                                //If the ID of the card exists in the inventory already then a duplicate is found
                                if (copyInventory[y].id === cardsPulled[i].id){
                                    //console.log("duplicate: " + cardsPulled[i].id);
                                    //Quanity is set to 2 if quantity does not exist yet
                                    if (!copyInventory[y].quantity){
                                        //console.log("first dupe")
                                        copyInventory[y].quantity = 2
                                    } 
                                    //if quantity already exists then it is simply incremented by 1
                                    else {
                                        //console.log("not first")
                                        copyInventory[y].quantity = copyInventory[y].quantity + 1
                                    }
                                    
                                    //Found duplicate is set to true so we know whether or not this is a brand new card
                                    foundDuplicate = true;
                                    break;
                                }
                            }

                            //if this is not a duplicate and it is a brand new card then the whole card can be added to the users inventory instead of just incrementing the quantity of the card
                            if (!foundDuplicate){
                                //console.log("No dupe: " + cardsPulled[i].id)
                                copyInventory.push(cardsPulled[i]);
                                copyInventory[copyInventory.length-1].quantity = 1;
                            }
                        }

                        //Inventory needs to be marked as modified in order for it to update for some reason
                        user.markModified("inventory");

                        //Update the users inventory with the new edited copy
                        await User.findOneAndUpdate(
                            {"_id": json._id, "inventory.code": pack.code},
                            {$set: {"inventory.$.cards": copyInventory}},
                            {useFindAndModify: false}
                        );

                        //Remove the user from the array that deals with the users that are curreently having requests processed so they are able to open a new pack
                        let index = currentlyOpenUsers.indexOf(req.header("x-auth-token"))
                        if (index > -1){
                            currentlyOpenUsers.splice(index, 1)
                        }

                        return;
                    });
                    })

                    
                })
            });
        }); 
    } else {
        res.status(400).json({error: "Sorry Still Processing Last Pack, Please Try Again In A Few Seconds"})
        return;
    }
})


module.exports = router;