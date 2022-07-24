const pool = require('./dbconnect/dbconnect');

exports.getAll = (limit)=>{
    return pool.query(
        `SELECT * FROM category LIMIT $1;`,[limit]
    )
}
