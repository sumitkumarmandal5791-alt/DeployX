const redis = require("redis");

const redisClient = redis.createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.REDIS_HOST_ID,
        port: 16597
    }
})


module.exports = redisClient;

