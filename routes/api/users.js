const router = require("express").Router();
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");
let User = require("../../schemas/userSchema");

const sanitize = require("mongo-sanitize");

//Was initially used for logging in and handing ALL user related requests but "auth.js" took over that job once the JWT system was implemented

//This route is only used to create a new user, the auth route deals with everything else login related since it is expected you will require authroization for everything that is not creating a brand new user
router.route("/").post((req, res) => {
    let {username, email, password, confirmPassword} = req.body;

    email = sanitize(email)

    if(!username || !email || !password){
        return res.status(400).json({msg: "Please Enter All Fields"});
    }

    if (password != confirmPassword){
        return res.status(400).json({msg: "Passwords do not match"});
    }

    User.findOne({email: email})
    .then(user => {
        if(user){
            return res.status(400).json({msg: "User Already Exists"});
        }

        const newUser = new User({
            username: username,
            email: email,
            password: password,
        })

        //Generate hash salt
        bcrypt.genSalt(10, (err, salt) => {
            //Hash the users password with the salt
            bcrypt.hash(newUser.password, salt, (err, hash) =>{
                //Throw error if any
                if (err){
                    throw err;
                }

                //Set their password to the hashed version of their password
                newUser.password = hash;
                //Save the user
                newUser.save()
                .then(user => {

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

                    //Send a reply back containing details about the user

                })
            })
        })
    })
});

module.exports = router;