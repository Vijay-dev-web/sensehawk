const jwt = require('jsonwebtoken')
const User = require('../models/User')

const requireAuth = (req, res, next) => {
    
    const token = req.cookies.jwt_canbeanything

    //check jwt exists and valid

    if(token){
        jwt.verify(token, 'jwt secret code', (err, decodedToken) => {
            if(err){
                console.log(err);
                res.redirect('/login')
            }
            else{
                console.log(decodedToken)
                next()
            }
        })
    }
    else{
        res.redirect('/login')
    }
}

const checkUser = (req, res, next) => {

    const token = req.cookies.jwt_canbeanything
    
    if(token) {
    jwt.verify(token, 'jwt secret code', async (err, decodedToken) => {
        if(err){
            res.locals.user = null
            next()
        }
        else {
            const user = await User.findById(decodedToken.id)
            res.locals.user = user
            next()
        }
    })

    } else {
        res.locals.user = null
        next()
    }


}

const checkSession = ((req, res, next) => {
    if(req.session.key){
        console.log('Checking Session');
        next()
    } else {
        // res.redirect.json('Please login first').redirect('/login')
        // res.redirect('/login')
        res.json('Unauthorised user')
    }
})

module.exports = { requireAuth, checkUser, checkSession }