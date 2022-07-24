const productModel = require('../../models/product');
const service = require('./service')

exports.getTopSellingProductByTag = async (req,res)=>{
    const tagId = req.query.id;

    const products = await productModel.getTopSellingProductByTag(tagId);

    res.status(200).json(products.rows);
}