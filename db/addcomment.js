const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    name: String,
    org: String,
    comment: String,
    likes: Number
});
const comment = mongoose.model('comment', commentSchema);

module.exports = { comment}