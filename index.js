
require("dotenv").config();
const express = require("express");
const { main } = require("./src/config/database")
const app = express();
const redisClient = require("./src/config/Reddis")
const cookieParser = require('cookie-parser')
const cors = require("cors")

app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))
//cors issue resolve



app.use(express.json());
app.use(cookieParser());




const InitalizeConnection = async () => {
    try {
        await Promise.all([main(), redisClient.connect()])
        console.log("CONNECTED TO DATABASE")
        app.listen(process.env.PORT, () => {
            console.log("Server is Listening at Port Number:" + process.env.PORT)
        })

    }
    catch (error) {
        console.log("DATABASE CONNECTION FAILED" + error.message);

    }
}

InitalizeConnection();