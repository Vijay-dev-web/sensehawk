const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = mongoose.Schema({

    regionId: {
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


    description: {
        type: String
    },

    // location: {
    //     <field>: { type: <GeoJSON type> , coordinates: <coordinates> }
    // },

    location: {
        type: 'String',
        coordinates: []
    },

    owner: {
        type: String
    }
})

const Region = mongoose.model('region', userSchema)

module.exports = Region