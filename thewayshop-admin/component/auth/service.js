const pool = require('../../models/config/dbconnect')
exports.findOne = (username)=>{
    return pool.query(
    `SELECT * FROM manager WHERE username=$1;`,[username]
    )
}
exports.findAll = pool.query(
        `SELECT username as name
        FROM manager;`
    )
 