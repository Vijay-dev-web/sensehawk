const User = require('../models/User')
const jwt = require('jsonwebtoken')
const { redisClient } = require('../redis/redisController')
const { query } = require('express')




// Port

const auth_token_name = "auth_token"
//Handle errors

const handleErrors = (err) => {
    //  console.log(err.message, err.code);
    let errors = { contact: '', password: '', blacklist: '' }
    // console.log(err.message);
    if (err.code === 11000) {
        errors.contact = "User already registered"
        //  console.log(err);
        return errors
    }

    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message
        })
        return errors
    }
    //  console.log(errors);

    if (err.message.includes('incorrect contact')) {
        errors.contact = 'User is not registered'
    }

    if (err.message.includes('incorrect password')) {
        errors.password = 'Incorrect Password'
    }

    if (err.message.includes('Number registered')) {
        errors.contact = 'Number is already registered'
    }
    return errors

}

const tokenMaxAge = 60 * 60
const createToken = (jsonToken) => {
    const tok = jwt.sign(jsonToken, process.env.JWT_SECRET_KEY, { expiresIn: tokenMaxAge })
    // console.log(tok)
    return tok
}


module.exports.signup_get = (req, res) => {
    res.locals.user = null
    res.render('signup')
}

module.exports.login_get = (req, res) => {
    // res.json(req.session).render('login')
    // TODO: Check if the incoming request is authenticated. If yes, send him to /home
    res.locals.user = null
    res.locals.req = req;
    res.render('login')
}

module.exports.signup_post = async (req, res) => {
    const { name, contact, address, gender, country, password } = req.body
    // console.log(req.body);
    try {

        // console.log('Con : ' , contact)
        const con = await User.findOne({ 'contact': contact })
        // console.log(con.contact);
        // console.log('DB user : ', con.contact)
        if (con) {
            throw Error('Number registered')

        }

        const user = await User.create({ contact, name, address, gender, country, password })
        // console.log('User contact : ', user);
        const token = createToken({ "name": user.name, "contact": user.contact })
        res.cookie(auth_token_name, token, { httpOnly: true, maxAge: tokenMaxAge * 1000 })
        // req.session.key = user._id
        // console.log('User successfully created : ', user);
        res.status(201).json({ user: user._id })
    } catch (err) {
        var e = handleErrors(err)
        console.log(err);
        res.status(400).json({ e })    // ('error, user not created')
    }
}

module.exports.login_post = async (req, res) => {
    const { contact, password } = req.body

    try {
        const user = await User.login(contact, password)
        // console.log('DB user : ', user);
        const token = createToken({ "name": user.name, "contact": user.contact })
        res.cookie(auth_token_name, token, { httpOnly: true, tokenMaxAge: tokenMaxAge * 1000 })
        res.status(200).json({ user: user._id })
    }

    catch (err) {
        console.log(err);
        const errors = handleErrors(err)
        res.status(400).json({ errors })
    }

}

// const getTokenExpiry = (token) => {
//     return 60
// }

module.exports.find_get = ((req, res) => {
    // res.locals.user = null
    res.render('find')
})

module.exports.find_post = async (req, res) => {
    let queryInput = req.body.query;
    let pattern = /[0-9]/g;
    let searchObj = {};
    if (queryInput.match(pattern)) {
        searchObj = {
            "contact": queryInput
        }
    } else {
        searchObj = {
            "name": queryInput
        }
    }

    try {
        const users = await User.find(searchObj)
        res.locals.find_results = users;
        console.log('Redirected to find results');
        res.status(200).json(users)
    } catch (err) {
        console.log(err);
    }
}

module.exports.logout_get = (req, res) => {
    const token = req.cookies.auth_token
    console.log('Token going to Redis => ', token);
    // rexp.set(token, token).at(getTokenExpiry(token)) // key will be expire in 60sec
    redisClient.set(token, '1')
    redisClient.expire(token, tokenMaxAge)

    res.cookie(auth_token_name, '', { tokenMaxAge: 1 })
    res.redirect('/login')
}

module.exports.handleErrors = handleErrors
