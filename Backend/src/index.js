const express = require('express')
const app = express();
require('dotenv').config();
const main =  require('./config/db')
const cookieParser =  require('cookie-parser');
const authRouter = require("./routes/userAuth");
const redisClient = require('./config/redis');
const problemRouter = require("./routes/problemCreator");
const submitRouter = require('./routes/submit');
const aiRouter = require("./routes/aiChatting");
const videoRouter = require("./routes/videoCreator");
const cors = require('cors');


app.use(cors({
    origin: 'http://localhost:5173',           // http://localhost:5173 ki jagah agar * likh do toh koi bhi data ko access kar sakta hai aur kewal ye http://localhost:5173 likha hai toh yhi bss data ko access kar payega
    credentials: true
}));
 
 
app.use(express.json());  
app.use(cookieParser());
 
app.use('/user',authRouter);
app.use('/problem',problemRouter);
app.use('/submission', submitRouter);
app.use("/ai", aiRouter);
app.use("/video",videoRouter);



const InitalizeConnection = async ()=>{
    try{

        // aur promise.all se redis and db dono ek sath chalte hai parallely, main() hai db wala
        // Promise.all is the key change. If either MongoDB or Redis fails to connect, the server won't start, preventing partial failures. 
        await Promise.all([main(),redisClient.connect()]);
        console.log("DB & RedisDb Connected");
        
        app.listen(process.env.PORT, ()=>{
            console.log("Server listening at port number: "+ process.env.PORT);
        })

    }
    catch(err){
        console.log("Error: "+err);
    }
}


InitalizeConnection();

