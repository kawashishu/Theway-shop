const pool = require('../../models/config/dbconnect');

exports.getOrderProduct = (order_id)=>{
    return pool.query(
        `SELECT title,price,image,quantity FROM order_product,product
        WHERE order_id=$1
        AND product_id=id`,[order_id]
    )
}

exports.setState = (state_id,order_id)=>{
    return pool.query(
        `UPDATE orders SET state=$1 WHERE id =$2;`,[parseInt(state_id),order_id]
    )
}