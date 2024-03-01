const mongoose = require('mongoose');

const waiting = new mongoose.Schema({
    id_w: {type: String, required: true},
    email: {type: String, required: true},
    name: {type: String, required: true},
    pass: {type: String, required: true},
    org: {type: String, required: true},
    rollno: {type: String, required: true},
    approve: {type: Boolean, required: true},
})

const waitinguser = mongoose.model('waitingUser', waiting);

module.exports = {waitinguser};