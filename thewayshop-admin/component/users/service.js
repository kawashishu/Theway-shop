const pool = require('../../models/config/dbconnect');
const limit = 9;

exports.maxPage = ()=> {
    return pool.query(
        `SELECT ceil(COUNT(*)/$1::numeric) as max_page FROM users;`,[limit]
    )
}
exports.getRecord = (page)=>{
    return pool.query(
        `SELECT foo.id, foo.email, foo.name, foo.address,foo.balance,sum(foo.total_order) as total_order,sum(foo.total_spend) as total_spend
        FROM(SELECT id, email, name, address,balance, 0 as total_order ,0 as total_spend
            FROM users 
            UNION 
            SELECT users.id, users.email, name,users.address,balance,count(*) as total_order, sum(total) as total_spend
            FROM orders,users 
            WHERE users.id=orders.user_id  
            GROUP BY users.id, users.email, users.name, users.address,users.balance) 
            as foo 
        GROUP BY foo.id, foo.email, foo.name, foo.address,foo.balance
        LIMIT $1 OFFSET $2;`,[limit,(page-1)*limit]
      )
}
exports.block = (id, is_block) => {
    return pool.query(
        `UPDATE users SET is_delete = $2 WHERE id = $1;`[id, is_block]
    )
}

exports.recordData = (id) => {
    return pool.query(
        `SELECT users.id, users.email, users.name, users.address,users.balance,count(orders.id) as "Total orders",sum(orders.total) as "Expended", users.is_delete
        FROM users left join orders on users.email = orders.email where users.id = $1
        group by users.id;`,[id]
    )
}
