const mongoose = require('mongoose');

const projSchema = new mongoose.Schema({
    id_p: String,
    title: String,
    statement: String,
    description: String,
    org: String,
    contributors: Array,
    category: String,
    tech: Array,
    picture: String,
    documentation: String,
    architecture_description: String,
    sponsors: Array,
    video_url: String,
    insta: String,
    twitter: String, 
    github: String,
    slack: String
})

const addproj = mongoose.model('addproj', projSchema);
module.exports = {addproj}