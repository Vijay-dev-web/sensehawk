// Redis
// const session = require('express-session')
const redis = require('redis');
// const connectRedis = require('connect-redis');
const redisRemoteClientOptions = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
}
const redisClient = redis.createClient(redisRemoteClientOptions)
module.exports = { redisClient }
