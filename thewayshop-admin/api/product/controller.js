const {productCache} = require('../../config/lruCache');
const service = require('./service')

exports.getProductPage = async(req,res)=>{
    const page = Math.max(parseInt(req.query.page)||1,1);
    let product_page = productCache.get(`product_page${page}`);
    if(!product_page){
        try{
            const products = await service.getAll(parseInt(page));
            product_page = products.rows;
            productCache.set(`product_page${page}`,product_page);
        }
        catch(e){
            res.status(400).json(e)
        }
    }
    res.status(200).json(product_page);   
}

exports.searchProduct = async(req,res)=>{
    let {q,page} = req.query;
    page = Math.max(parseInt(page)||1,1);

    const search_result = await service.searchName(q,page);
    res.json(search_result.rows)
}