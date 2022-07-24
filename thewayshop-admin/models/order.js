const pool = require('./config/dbconnect')
const limit = 8;

exports.countOrderSenT = ()=>{
    return pool.query(
        `select count(id) as count
        from orders
        WHERE to_char(create_date::date,'MM')= to_char(now()::date,'MM') and state = 2;`
    )
}

exports.countOrderUnSentMonth = ()=>{
    return pool.query(
        `select count(id) as count
        from orders
        WHERE to_char(create_date::date,'MM')= to_char(now()::date,'MM') and state = 1;`,
    )
}