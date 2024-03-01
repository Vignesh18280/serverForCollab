const mongoose = require('mongoose');

const freellanceSchema =new mongoose.Schema({
    email: {type: String, required: true},
    name: {type: String, required: true},
    description: {type: String, required: true},
    category: {type: String, required: true},
    budget: {type: Number, required: true},
});

const freelance = mongoose.model('freelance', freellanceSchema);

module.exports = {freelance}