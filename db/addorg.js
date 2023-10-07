const mongoose = require('mongoose');

const orgSchema = mongoose.Schema({
    id_o: String,
    name: String,
    email: String,
    pass: String,
    students: Array,
    projects: Array,
    hackathons_p: Array,
    hackathons_w: Array,
    ranking: Number,
    picture: Buffer,
    description: String,
    wlist_p: Array,
    wlist_u: Array
})

module.exports = mongoose.model('org', orgSchema);