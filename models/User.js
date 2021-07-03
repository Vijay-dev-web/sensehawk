const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = mongoose.Schema({

    contact: {
        type: Number,
        required: true,
        unique: true
        // minlength: [10, 'Contact number should have minimum 10 characters'],
        
    },

    name: {
        type: String,
        required: true,
        lowercase: true
    },


    address: {
        type: String        
    },

    gender: {
        type: String
    },

    country: {
        type: String
    },

    password: {
        type: String,
        required: [true, 'Please enter Password '], 
        minlength: [6, 'Minimum length is 6 Characters']
    }
})

userSchema.post('save', function(doc, next) {
    console.log("New user created : ", doc )
    next()
})

userSchema.pre('save', async function(next){
    var salt = await bcrypt.genSalt()
    this.password = await  bcrypt.hash(this.password, salt)
    // console.log("New user is about to be created ", this)
    next()
})

// Static method to login user
userSchema.statics.login = async function(contact, password){
    // console.log('contact : ', contact);
    const user = await this.findOne({ contact })
    if(user){        
        const auth = await bcrypt.compare(password, user.password)
        if(auth){
            // console.log('Correct user');
            return user
        }
        throw Error('incorrect password')
    }
    throw Error('incorrect contact')
}
 
const User = mongoose.model('user', userSchema)

module.exports = User