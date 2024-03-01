const mongoose = require('mongoose');

const followers = new mongoose.Schema({
    id_f: {type: String, required: true},
    followers: [],
    following: []

})

const foll = mongoose.model('foll', followers);

module.exports = {foll};