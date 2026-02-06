
require("dotenv").config();
const express = require("express");
const { main } = require("./src/config/database")
const app = express();
const redisClient = require("./src/config/Reddis")
const cookieParser = require('cookie-parser')
const cors = require("cors")
const userRouter = require("./src/Routes/userRoutes")
const adminRouter = require("./src/Routes/adminRoute")
const RewardRouter = require("./src/Routes/reward")
const SmartBinRouter = require("./src/Routes/smartBinRoute")
const badgesRouter = require("./src/Routes/badgesRoutes")
const TransactionRouter = require("./src/Routes/transactionRoute")
const RedemptionRouter = require("./src/Routes/redemptionRoutes");
const wasteRouter = require("./src/Routes/wasteTypeRoutes");

const allowedOrigin = process.env.NODE_ENV === 'production' ? process.env.CORS_ORIGIN_PROD : process.env.CORS_ORIGIN_DEV;

app.use(cors({
    origin: allowedOrigin,
    credentials: true
}));



app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/reward", RewardRouter);
app.use("/smartbin", SmartBinRouter);
app.use("/badges", badgesRouter);
app.use("/transaction", TransactionRouter);
app.use("/redemption", RedemptionRouter);
app.use("/waste", wasteRouter);




const { Server } = require("socket.io");
const http = require("http");

const InitalizeConnection = async () => {
    try {
        await Promise.all([main(), redisClient.connect()])
        console.log("CONNECTED TO DATABASE")

        const server = http.createServer(app);
        const io = new Server(server, {
            cors: {
                origin: allowedOrigin,
                methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
                credentials: true
            }
        });

        // Make io accessible in routes
        app.set('io', io);

        io.on("connection", (socket) => {
            console.log(`User Connected: ${socket.id}`);

            socket.on("disconnect", () => {
                console.log("User Disconnected", socket.id);
            });
        });

        server.listen(process.env.PORT, () => {
            console.log("Server is Listening at Port Number:" + process.env.PORT)
        })

        // Start Simulator (optional, for demo)
        require('./src/utils/simulator')(io);

    }
    catch (error) {
        console.log("DATABASE CONNECTION FAILED" + error.message);

    }
}

InitalizeConnection();