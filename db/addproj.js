const mongoose = require('mongoose');

const projSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    id_p: String,
    title: String,
    statement: String,
    description: String,
    org: String,
    contributors: Array,
    category: String,
    tech: Array,
    picture: String,
    architecture_img: String,
    architecture_description: String,
    sponsors: Array,
    video_url: String,
    insta: String,
    twitter: String, 
    github: String,
    slack: String
})

module.exports = mongoose.model('addproj', projSchema);