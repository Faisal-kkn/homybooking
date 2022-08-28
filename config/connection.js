const mongoClient = require('mongodb').MongoClient

const state = {
    db:null
}

module.exports.connect = (done) => {
    const url = 'mongodb+srv://Faisal:Kkn9946099846@cluster0.idf33go.mongodb.net/?retryWrites=true&w=majority'
    const dbname = 'Hotel'

    mongoClient.connect(url, (err, data) => {
        if (err) return done(err)
        state.db = data.db(dbname)
        done()
    })
}

module.exports.get = function () {
    return state.db
}

