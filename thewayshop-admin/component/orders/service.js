const pool = require('../../models/config/dbconnect');
const limit = 9;
exports.maxPage = ()=> {
    return pool.query(
        `SELECT ceil(COUNT(*)/$1::numeric) as max_page FROM orders;`,[limit]
    )
}
exports.getAllRecord = (page)=>{
    return pool.query(
        `SELECT orders.id,user_id,fullname,email,address,detail_address,payment,total,state as state_id,order_state.description as state,TO_CHAR(create_date::date, 'dd-mm-yyyy') as createdate,cancel FROM orders,order_state WHERE state=order_state.id ORDER BY create_date DESC
        LIMIT $1 OFFSET $2;`,[limit,(page-1)*limit]
    )
}
exports.recordOrder = (page, record_id)=>{
    return pool.query(
        `SELECT order_product.order_id, order_product.product_id, product.title, order_product.quantity  
        FROM order_product, product 
        WHERE order_product.order_id =$1 and order_product.product_id = product.id LIMIT $2 OFFSET $3;`,[record_id, limit,(page-1)*limit]
    )
}