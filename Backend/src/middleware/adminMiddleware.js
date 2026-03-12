const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient = require("../config/redis")

const adminMiddleware = async (req,res,next)=>{

    try{

        // Extract token from user's browser cookies
        const {token} = req.cookies;

        // If no token, kick them out immediately.
        if(!token)
            throw new Error("Token is not persent");

        // Decode the token using our secret key. 
        // If token is fake/expired, this line automatically throws an error.
        const payload = jwt.verify(token,process.env.JWT_KEY);

        // Extract the user's ID from the decoded payload
        const {_id} = payload;

        //id nhi mili throw error
        if(!_id){
            throw new Error("Invalid token");
        }

        // Go to MongoDB and find the user with this ID to make sure they still exist.
        const result = await User.findById(_id);

        //agar admin nhi hai toh throw error
        if(payload.role!='admin')
            throw new Error("Invalid Token");

        // Handling case where user was deleted after getting token.
        if(!result){
            throw new Error("User Doesn't Exist");
        }

        
        // result mil gya Redis ke blockList mein persent toh nahi hai
        const IsBlocked = await redisClient.exists(`token:${token}`);

        // If found in Redis, it means user logged out. Reject.
        if(IsBlocked)
            throw new Error("Invalid Token");

        // Attach the full user object to request (so controller can use it)
        req.result = result;


        next();
    }
    catch(err){
        res.status(401).send("Error: "+ err.message)
    }

}


module.exports = adminMiddleware;
