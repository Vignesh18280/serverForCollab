const mongoose = require('mongoose');

const freellanceSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: {type: String, required: true},
    name: {type: String, required: true},
    description: {type: String, required: true},
    category: {type: String, required: true},
    budget: {type: Number, required: true},
});

module.exports = mongoose.model('freelance', freellanceSchema);