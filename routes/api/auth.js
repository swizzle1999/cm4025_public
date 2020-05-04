const router = require("express").Router();
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");
const auth = require("../../middleware/auth")
let User = require("../../schemas/userSchema");
const sanitize = require("mongo-sanitize");

//This route deals with anything that relates to an individual user and authenticiation i.e. logging on or retriving an inventory
//This API calls is used by other routes such as "packs.js" for authenticating a user
//In order to use this route users will need to send their token along with the request for authenticiation

//Used as a login route
router.post("/", (req, res) => {
    let {email, password} = req.body;
    email = sanitize(email);
    password = sanitize(password);

    //Make sure both email and password fields are fill
    if(!email || !password){
        return res.status(400).json({msg: "Please Enter All Fields"});
    }

    //Find a user with the specified email
    User.findOne({email: email}).select("username email password")
    .then(user => {
        //If the user does not exist send an error message
        if(!user){
            return res.status(400).json({msg: "User Does Not Exist"});
        }
        //Validate password
        //Compare the two passwords to eachother and check if they match
        bcrypt.compare(password, user.password)
        .then(isMatch => {
            if(!isMatch){
                return res.status(400).json({msg: "Invalid Credentials"});
            }

            //Create a JWT token for the user and return it to them so they can use it with future API requests
            jwt.sign(
                {id: user.id},
                config.get("jwtSecret"),
                {expiresIn: 3600},
                (err, token) => {

                    if (err){
                        throw err;
                    }

                    res.json({
                        token: token,
                        user: {
                            id: user.id,
                            username: user.username,
                            email: user.email,
                        }
                    })

                }
            )
        })
    })
});

//Retrieve a user via their ID
router.get("/user", auth, (req, res) => {
    let id = sanitize(req.user.id)
    User.findById(id)
    .select("-password -inventory")
    .lean()
    .then(user => {
        res.json(user)
    })
})

//Retrieve a users inventory via their ID
router.get("/user/inventory", auth, (req, res) => {
    let id = sanitize(req.user.id)
    User.findById(id)
    .select("inventory")
    .lean()
    .then(user => {
        res.json(user)
    })
})

//Delete a user of a specified ID
router.get("/user/delete", auth, (req, res) => {
    let id = sanitize(req.user.id)
    User.deleteOne({_id: id})
    .then(output => {
        res.sendStatus(200)
    })
})

module.exports = router;