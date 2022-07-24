const pool = require('./config/dbconnect')

exports.getAllTag =  pool.query(
        `select *
        from tag;`
    );
exports.getTagName = (id) => {
    return pool.query(
        `select name
        from tag
        where id = $1`,[id]
    );
}