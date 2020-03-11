const DB = require('./DB.js')
const settings = {
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_SCHEME
}

module.exports = new DB(settings)