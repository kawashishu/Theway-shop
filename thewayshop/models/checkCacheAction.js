const pool = require('./dbconnect/dbconnect');

exports.checkClear = ()=>{
    return pool.query(
        `SELECT action FROM cache_action WHERE name = 'clear';`
    );
}


exports.setClear = ()=>{
    return pool.query(
        `UPDATE cache_action SET action=false WHERE name='clear';`
    );
}
