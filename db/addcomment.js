const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    org: String,
    comment: String,
    likes: Number
});

module.exports = mongoose.model('comment', commentSchema);