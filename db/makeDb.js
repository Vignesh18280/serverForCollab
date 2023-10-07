const MongoClient = require('mongodb').MongoClient

class Connection {

    static async open() {
        if (this.db) return this.db
        this.db = await MongoClient.connect(this.url, this.options)
        return this.db
    }

}

Connection.db = null
Connection.url = 'mongodb://localhost:27017'
Connection.options = {
    useNewUrlParser:    true,
    useUnifiedTopology: true,
}

module.exports = { Connection }