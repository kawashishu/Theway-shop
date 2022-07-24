const pool = require('../models/dbconnect/dbconnect');

module.exports = (req,res,next)=>{
    const date = new Date();
    const month = date.getMonth()+1;
    const year = date.getFullYear();

    pool.query(
        `SELECT * FROM visit WHERE _month =$1 AND _year=$2;`,[month,year],(err,result)=>{
            if(err){
                console.log(err);
                next()
            }
            else{
                if(result.rows.length>0){
                    pool.query(
                        `UPDATE visit SET _count = _count +1 WHERE _month = $1 AND _year=$2;`,[month,year]
                    )
                }
                else{
                    pool.query(
                        `INSERT INTO visit(_month,_year,_count)
                        VALUES ($1,$2,1);`,[month,year]
                    )
                }
            }
        }
    )
    next();
}
