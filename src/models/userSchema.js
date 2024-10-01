const { Schema, model } = require("mongoose")
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
});


  
const userModal = model("User", userSchema)

module.exports = userModal