// const MongoClient = require('mongodb').MongoClient
// const ENV = require('dotenv').config();

// class Connection {

//     static async open() {
//         if (this.db) return this.db
//         this.db = await MongoClient.connect(this.url, this.options)
//         return this.db
//     }

// }

// Connection.db = null
// Connection.url = process.env.CONNECTION_URL
// Connection.options = {
//     useNewUrlParser:    true,
//     useUnifiedTopology: true,
// }

// module.exports = { Connection }