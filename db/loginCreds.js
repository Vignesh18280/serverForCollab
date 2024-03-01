const mongoose = require('mongoose');

const login = new mongoose.Schema({
    email: {type: String, required: true},
    password: {type: String, required: true},
    tt: {type: String, required: false}
})

const loginCred = mongoose.model('loginCred', login);

module.exports = {loginCred};