const pool = require('./config/dbconnect')
const limit = 8;
exports.getTotalUserRecord = pool.query(
    `select users.id, users.name, users.birthday, users.image, sum(orders.total) as total, count(orders.total) as total1
    from users, orders
    where users.id = orders.user_id 
    group by users.id, users.name, users.birthday, users.image
    order by total desc`
)