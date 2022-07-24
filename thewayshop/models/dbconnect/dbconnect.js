const Pool = require("pg").Pool;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL||process.env.DATABASE_URL_LOCAL,
  ssl:{
    rejectUnauthorized: false
  },
});

module.exports = pool;