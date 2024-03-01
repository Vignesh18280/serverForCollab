const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    org: String,
    comment: String,
    likes: Number
});
const comment = mongoose.model('comment', commentSchema);

module.exports = { comment}