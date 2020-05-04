const router = require("express").Router();
const fetch = require("node-fetch");
const auth = require("../../middleware/auth")

let User = require("../../schemas/userSchema");
let ShopItem = require("../../schemas/shopSchema");

const sanitize = require("mongo-sanitize"); 

//API for all the items you can buy from a shop
//Requests that end in "requirments" will pull the information about what you need to do in order to get this upgrade from the database
//Other requests will attempt to buy the upgrade in question

//Returns the progress the user has made in the packs that have the same level as them
router.get("/level/requirments", auth, (req, res) => {
    //First retireve the user that made the request
    fetch("http://localhost:5000/api/auth/user", {method: "GET", headers:{"accepts": "application/json", "Content-Type": "application/json", "x-auth-token": req.header("x-auth-token")}})
    .then(res => res.json())
    .then(user => {
        if (user.level){
            //Retrieve all packs
            fetch("http://localhost:5000/api/packs/", {method: "GET"})
            .then(res => res.json())
            .then(async json => {
                //Retrieve the users inventory
                fetch("http://localhost:5000/api/auth/user/inventory", {method: "GET", headers:{"accepts": "application/json", "Content-Type": "application/json", "x-auth-token": req.header("x-auth-token")}})
                .then(res => res.json())
                .then(userWithInventory => {

                    //Array to hold the progress for all packs
                    let packProgress = []
                    //itterate through each pack in the database
                    json.packs.forEach(pack => {
                        //Only check packs where the users level equals the pack level since that is all that is relivant to leveling up
                        if (pack.level == user.level){
                            //If the user has never open the pack before then we know instnatly they have no cards from it
                            let hasOpenedPackBefore = false;
                            //Itterate through the users entire inventory
                            for (let i = 0; i < userWithInventory.inventory.length; i++){
                                //if the users inventory pack code is the same as the pack we are searching for then the user has opened this pack before
                                //We can there for push the number of cards the user owns from this pack onto the packProgress array
                                if (userWithInventory.inventory[i].code == pack.code){
                                    hasOpenedPackBefore = true;
                                    packProgress.push([pack.name, userWithInventory.inventory[i].cards.length, pack.totalCards, Math.round(pack.totalCards*0.1)])
                                }
                            }
                            if (!hasOpenedPackBefore){
                                packProgress.push([pack.name, 0, pack.totalCards, Math.round(pack.totalCards*0.1)])
                            }
                        }
                    })

                    //We can then return the array of packProgress which will contain the number of cards the user has open from each pack that is at their level.
                    res.status(200).json(packProgress)
                });
            })

            
        }
        

    })
})

//Route that deals with actually leveling up the player
router.get("/level/", auth, (req, res) => {
    //Retrieve the user that made the request
    fetch("http://localhost:5000/api/auth/user", {method: "GET", headers:{"accepts": "application/json", "Content-Type": "application/json", "x-auth-token": req.header("x-auth-token")}})
    .then(res => res.json())
    .then(user => {
        if (user.level){
            //Retrieve all packs
            fetch("http://localhost:5000/api/packs/", {method: "GET"})
            .then(res => res.json())
            .then(async json => {
                //Retieve users inventory
                fetch("http://localhost:5000/api/auth/user/inventory", {method: "GET", headers:{"accepts": "application/json", "Content-Type": "application/json", "x-auth-token": req.header("x-auth-token")}})
                .then(res => res.json())
                .then(userWithInventory => {

                    let canLevelUp = true
                    let numberOfPacksNeededToLevelUp = 0
                    //Itterate through each pack that exists and check if the user has atleast 80% of all the cards from that set in order to level up
                    json.packs.forEach(pack => {
                        if (pack.level == user.level){
                            numberOfPacksNeededToLevelUp += 1
                            let hasOpenedPackBefore = false
                            for (let i = 0; i < userWithInventory.inventory.length; i++){
                                if (userWithInventory.inventory[i].code == pack.code){
                                    hasOpenedPackBefore = true
                                    if (!(userWithInventory.inventory[i].cards.length >= Math.round(pack.totalCards*0.1))){
                                        canLevelUp = false
                                    }
                                }
                            }

                            if (!hasOpenedPackBefore){
                                canLevelUp = false
                            }
                        }
                    })
                    
                    if (numberOfPacksNeededToLevelUp == 0){
                        canLevelUp = false;
                    }

                    //if it is deemed the user can level up then simply increment their level by one
                    if (canLevelUp){
                        User.findOne({"_id": user._id}, (err,data) => {
                            if (err){
                                res.status(400).json("Error: " + err);
                                return;
                            } else {
                                data.level += 1
                                data.save()
                                res.status(200).json({msg: "User Leveled Up"})
                            }

                        });

                    } else {
                        res.status(404).json({msg: "Sorry, You Do Not Meet The Requirments For This Purchase"})
                    }
                    
                });
            })

            
        }
        

    })
})

//Return the requirments for this shop item
router.get("/tickMultiplier/requirments", auth, (req, res) => {
    //Retrieve the user that made the request
    fetch("http://localhost:5000/api/auth/user", {method: "GET", headers:{"accepts": "application/json", "Content-Type": "application/json", "x-auth-token": req.header("x-auth-token")}})
    .then(res => res.json())
    .then(user => {
        if (user.tickMultiplierShopLevel && user.tickMultiplier){
            //Find the tickMultiplier shop items and sort them by level
            ShopItem.find({name: "tickMultiplier"})
            .sort("-level")
            .then(shopItems => {
                let nextLevelItem = null;
                //Itterate through the items and find the item that is our current level in that item + 1. I.e. the next item we can upgrade to. if we have level 2 in AFK Wallet we will want to upgrade to level 3. our current level +1
                shopItems.forEach(item => {
                    if (item.level == (parseInt(user.tickMultiplierShopLevel) + 1)){
                        nextLevelItem = item;
                    }
                });

                //if it is null then the user is max leveled in this 
                if (nextLevelItem == null){
                    res.status(500).json({msg: "Sorry, user is already max level for this item", "currentLevel": user.tickMultiplierShopLevel, "maxLevel": shopItems[0].level})
                    return;
                }

                requirments = {"currentLevel": user.tickMultiplierShopLevel, "maxLevel": shopItems[0].level, "nextLevelEffect": nextLevelItem.effect, "nextLevelCost": nextLevelItem.cost}

                res.status(200).json(requirments)
                return;
            })
            

        }
        

    })
})

//Similar to the requirments method but instead of simply returning the requirments it will attempt to actually buy the upgrade, remove money from the user and then apply the ugprade
router.get("/tickMultiplier/", auth, (req, res) => {
    fetch("http://localhost:5000/api/auth/user", {method: "GET", headers:{"accepts": "application/json", "Content-Type": "application/json", "x-auth-token": req.header("x-auth-token")}})
    .then(res => res.json())
    .then(user => {
        User.findOne({"_id": user._id})
        .then(user => {
            if (user.tickMultiplierShopLevel && user.tickMultiplier){
            
                ShopItem.find({name: "tickMultiplier"})
                .sort("-level")
                .then(shopItems => {
                    let nextLevelItem = null;
                    shopItems.forEach(item => {
                        if (item.level == (parseInt(user.tickMultiplierShopLevel) + 1)){
                            nextLevelItem = item;
                        }
                    });
    
                    if (user.tickMultiplierShopLevel == shopItems[0].level){
                        res.status(200).json({msg: "User already at max level"})
                        return;
                    }

                    if (user.money - nextLevelItem.cost < 0){
                        res.status(200).json({msg: "You Cannot Afford This Upgrade"})
                    return;
                    } else {
                        user.money -= nextLevelItem.cost;
                        //Increase the users tickMultiplier by the ammount shown by the shop item
                        user.tickMultiplier += nextLevelItem.effect;
                        user.tickMultiplierShopLevel += 1;
                        user.save()
                        res.status(200).json({msg: "Money Gain Rate Increased By " + nextLevelItem.effect})
                        return;
                    }

                })
                
            }
        })
    })
})

//The next two are nearly clones of the tickMultiplier routes above so just refer to those
router.get("/afkMax/requirments", auth, (req, res) => {
    fetch("http://localhost:5000/api/auth/user", {method: "GET", headers:{"accepts": "application/json", "Content-Type": "application/json", "x-auth-token": req.header("x-auth-token")}})
    .then(res => res.json())
    .then(user => {
        if (user.tickMultiplierShopLevel && user.tickMultiplier){

            ShopItem.find({name: "afkMax"})
            .sort("-level")
            .then(shopItems => {
                let nextLevelItem = null;
                shopItems.forEach(item => {
                    if (item.level == (parseInt(user.afkMaxShopLevel) + 1)){
                        nextLevelItem = item;
                    }
                });

                if (nextLevelItem == null){
                    res.status(500).json({msg: "Sorry, user is already max level for this item", "currentLevel": user.afkMaxShopLevel, "maxLevel": shopItems[0].level})
                    return;
                }

                requirments = {"currentLevel": user.afkMaxShopLevel, "maxLevel": shopItems[0].level, "nextLevelEffect": nextLevelItem.effect, "nextLevelCost": nextLevelItem.cost}

                res.status(200).json(requirments)
                
                return;
            })
            

        }
        

    })
})

router.get("/afkMax/", auth, (req, res) => {
    fetch("http://localhost:5000/api/auth/user", {method: "GET", headers:{"accepts": "application/json", "Content-Type": "application/json", "x-auth-token": req.header("x-auth-token")}})
    .then(res => res.json())
    .then(user => {
        User.findOne({"_id": user._id})
        .then(user => {
            if (user.afkMaxShopLevel && user.afkMax){
            
                ShopItem.find({name: "afkMax"})
                .sort("-level")
                .then(shopItems => {
                    let nextLevelItem = null;
                    shopItems.forEach(item => {
                        if (item.level == (parseInt(user.afkMaxShopLevel) + 1)){
                            nextLevelItem = item;
                        }
                    });
    
                    if (user.afkMaxShopLevel == shopItems[0].level){
                        res.status(200).json({msg: "User already at max level"})
                        return;
                    }

                    if (user.money - nextLevelItem.cost < 0){
                        res.status(200).json({msg: "You Cannot Afford This Upgrade"})
                        return;
                    } else {
                        user.money -= nextLevelItem.cost;
                        user.afkMax += nextLevelItem.effect;
                        user.afkMaxShopLevel += 1;
                        user.save()
                        res.status(200).json({msg: "Afk Wallet Size Increased By " + nextLevelItem.effect})
                        return;
                    }
                })
                
            }
        })
    })
})



module.exports = router;