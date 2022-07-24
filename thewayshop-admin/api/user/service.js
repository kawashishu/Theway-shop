const pool = require('../../models/config/dbconnect')

exports.block = (user_id)=>{
    return pool.query(
        `UPDATE users SET is_delete = 't' WHERE id=$1;`,[user_id]
    )
}
exports.unblock = (user_id)=>{
    return pool.query(
        `UPDATE users SET is_delete = 'f' WHERE id=$1;`,[user_id]
    )
}