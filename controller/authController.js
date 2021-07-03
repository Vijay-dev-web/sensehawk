const User = require('../models/User')
const jwt = require('jsonwebtoken')

//Handle errors

const handleErrors = (err) => {
    //  console.log(err.message, err.code);
     let errors = { contact: '', password: ''}
    // console.log(err.message);
     if(err.code === 11000){
         errors.contact = "User already registered"
        //  console.log(err);
         return errors
     }

     if (err.message.includes('user validation failed')){
         Object.values(err.errors).forEach(({properties}) => {
             errors[properties.path] = properties.message
         })
         return errors
     }
    //  console.log(errors);

    if(err.message.includes('incorrect contact')){
        errors.contact = 'User is not registered'
    }

    if(err.message.includes('incorrect password')){
        errors.password = 'Incorrect Password'
    }

    if(err.message.includes('Number registered')){
        errors.contact = 'Number is already registered'
    }
    return errors
     
}

const maxAge = 3 * 24 * 60 * 60
const createToken = (id) => {
    const tok = jwt.sign({ id }, 'jwt secret code', { expiresIn: maxAge })
    // console.log(tok)
    return tok
}


module.exports.signup_get = (req, res) => {
    res.render('signup')
}

module.exports.login_get = (req, res) => {
    console.log(req.session);
    // res.json(req.session).render('login')
    res.render('login')
}

module.exports.signup_post = async (req, res) => {
    const { name, contact, address, gender, country, password } = req.body
    // console.log(req.body);
    try{

        // console.log('Con : ' , contact)
        const con = await User.findOne({ 'contact': contact })
        // console.log(con.contact);
        // console.log('DB user : ', con.contact)
        if(con) {            
            throw Error('Number registered')    
            
        }
        
        const user = await User.create({ contact, name, address, gender, country, password })  
        console.log('User contact : ', user);      
        const token = createToken(user._id)
        res.cookie('jwt_canbeanything', token, { httpOnly: true , maxAge: maxAge * 1000 })
        req.session.key = user._id
        // console.log('User successfully created : ', user);
        res.status(201).json({ user: user._id })


    } catch(err){   
        
        var e = handleErrors(err)
        console.log(err);
        res.status(400).json({ e })    // ('error, user not created')
    }
}

module.exports.login_post = async (req, res) => {
    const { contact, password } = req.body

    try{
        const user = await User.login(contact, password)
        console.log('DB user : ', user);
        const token = createToken(user._id)        
        res.cookie('jwt_canbeanything', token, { httpOnly: true , maxAge: maxAge * 1000 })
        req.session.key = user._id
        res.status(200).json({ user: user._id })       

    }

    catch(err){
        console.log(err);
        const errors = handleErrors(err)
        res.status(400).json({ errors })
    }

}

module.exports.logout_get = (req, res) => {
    res.cookie('jwt_canbeanything', '', { maxAge: 1 })
    if(req.session.key){
        req.session.destroy(() => {
            console.log('Logout Session : ', req.session);
            console.log('Session Destroyed');
            //res.redirect('/login')
        })
    }
            
    res.redirect('/login')
}