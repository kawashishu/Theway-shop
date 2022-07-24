const pool = require('../../models/config/dbconnect');
exports.login = (username,password)=>{
    return pool.query(
    `SELECT * FROM manager WHERE username=$1 AND password=$2;`,[username,password]
    )
}
exports.getMember = pool.query(
        `SELECT fullname as name,image
        FROM manager;`
)

exports.getVisit = (limit)=>{
    return pool.query(
        `SELECT * FROM visit
                ORDER BY _year DESC,
                _month DESC
                LIMIT $1;`,[limit]
    )
}

exports.soldByTag = pool.query(
    `SELECT  tag.name, COUNT(quantity) FROM order_product,product,tag WHERE order_product.product_id = product.id AND product.tag_id = tag.id GROUP BY tag.name;`
)

exports.monthIncome = pool.query(
    `SELECT TO_CHAR(create_date, 'MM') as month,TO_CHAR(create_date, 'yyyy') as year,SUM(total) FROM orders GROUP BY month,year ORDER BY year, month;`
)