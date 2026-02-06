const redis = require("redis");

const redisClient = redis.createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.REDIS_HOST_ID,
        port: 16597,
        family: 4 // Force IPv4
    }
})

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));


module.exports = redisClient;

