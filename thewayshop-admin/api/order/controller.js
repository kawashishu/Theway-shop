const service = require('./service');

exports.orderProduct = async(req,res)=>{
    const order_id = req.params.order_id;
    if(!order_id){
        return res.status(400).json("no order_id");
    }
    const order_product = await service.getOrderProduct(order_id);
    res.status(200).json(order_product.rows);
}

exports.setState = async(req,res)=>{
    const {order_id,state_id} = req.body
    if(!order_id){
        return res.status(400).json("no order_id");
    }
    await service.setState(parseInt(state_id),order_id);
    res.status(200).json('success');
}   