const config = require("config");
const jwt = require("jsonwebtoken");

//A piece of middleware that is used to verify a token
function auth(req, res, next){
    const token = req.header("x-auth-token");

    //Check for token
    if (!token){
        res.status(401).json({msg: "No Token, Authorization Denied"})
        return;
    }

    try {
        //Verify token
        const decoded = jwt.verify(token, config.get("jwtSecret"));

        //Add user from payload
        req.user = decoded;
        next();
    } catch (e) {
        res.status(400).json({msg: "Token Is Not Valid"});
        return;
    }

}

module.exports = auth;