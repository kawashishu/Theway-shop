
const pool = require('./config/dbconnect')

exports.table =  pool.query(
        `SELECT table_name
        FROM information_schema.tables
       WHERE table_schema='public'
         AND table_type='BASE TABLE';`
    );

