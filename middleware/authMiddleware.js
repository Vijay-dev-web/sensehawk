const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { redisClient } = require('../redis/redisController')
const { handleErrors } = require('../controller/authController')
const { promisify } = require("util");
const redisClientGetAsync = promisify(redisClient.get).bind(redisClient);

const decodeToken = (token, res) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decodedToken) => {
            if (err) {
                console.log(err);
                return null
            }
            else {
                return decodedToken
            }
        })
    } catch (e) {
        console.log(e)
    }
}

const requireAuth = async (req, res, next) => {
    const token = req.cookies.auth_token
    console.log("Token -- In RequireAuth Function => ", token)
    if (token) {
        tokenValue = await redisClientGetAsync(token)
        if (tokenValue && tokenValue == '1') {
            res.locals.user = null
            res.redirect('/login?err=blacklisted_token')
        }
        else {
            decodedToken = decodeToken(token, res);
            console.log("Token test => ", decodedToken)
            if (decodedToken == null) {
                res.locals.user = null
                res.redirect('/login')
            }
            else {
                res.locals.user = decodedToken
                next()
            }
        }
    }
    else {
        res.locals.user = null
        res.redirect('/login')
    }
}

module.exports = { requireAuth }
