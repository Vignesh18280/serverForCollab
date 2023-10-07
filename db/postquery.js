const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    query_id: String,
    title: String,
    description: String,
    name: String,
    org: String,
    // picture: {
    //     type: Buffer,
    //     contentType: String,
    //     //required: false
    // },
    comments: Array
});

module.exports = mongoose.model('query', postSchema);
