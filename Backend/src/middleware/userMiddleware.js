const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient = require("../config/redis")

const userMiddleware = async (req, res, next)=>{

    try{

        //token cookies me hai aur nahi hai toh throw error
        const {token} = req.cookies;
        if(!token)
            throw new Error("Token is not persent");

        // When a user logs in (in userAuthent.js), we create a token using jwt.sign. Inside that token, we pack specific data about the user. That packed data is called the Payload.
        const payload = jwt.verify(token,process.env.JWT_KEY);

        // It simply pulls the _id property out of the payload object and creates a variable named _id with that value.   const _id = payload._id; // The old, long way
        const {_id} = payload;       //clean and modern way

        //agar id nhi hai toh throw err
        if(!_id){
            throw new Error("Invalid token");
        }

        //id mil gyi toh user ko validate karo
        // "Take that ID (_id) we just found and validte it against the REAL Users list (MongoDB)."
        const result = await User.findById(_id);

        
        if(!result){
            throw new Error("User Doesn't Exist");
        }

        // Redis ke blockList mein persent toh nahi hai

        const IsBlocked = await redisClient.exists(`token:${token}`);

        if(IsBlocked)
            throw new Error("Invalid Token");

        req.result = result;


        next();
    }
    catch(err){
        res.status(401).send("Error: "+ err.message)
    }

}


module.exports = userMiddleware;
