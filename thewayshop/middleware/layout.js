
const categoryModel = require('../models/category');
const tagModel = require('../models/tag');
const productModel = require('../models/product');
const checkCache = require('../models/checkCacheAction');
const {layout_cache,product_cache,filter_cache} = require('../helper/lruCache');
module.exports = async(req,res,next)=>{
    const coupons=['Off 10%! Shop Now Man','50% - 80% off on Fashion','20% off Entire Purchase Promo code: offT20','Off 50%! Shop Now','Off 10%! Shop Now Man','50% - 80% off on Fashion','20% off Entire Purchase Promo code: offT20'];
    let category_nav = layout_cache.get("category_nav");
    if(!category_nav){
        category_nav=[]
        const categories = await categoryModel.getAll(4);
        for await(const cate of categories.rows){
            const tag = await tagModel.getTagCate(cate.id,4);
            category_nav.push({
                id:cate.id,
                name:cate.name,
                tags:tag.rows
            })
        }
        layout_cache.set("category_nav",category_nav);
    }
    let tag =layout_cache.get("tag");
    if(!tag){
        tag = await tagModel.getAll();
        tag = tag.rows;
        layout_cache.set("tag",tag);
    }
    let brand=layout_cache.get("brand");
    if(!brand){
        brand = await productModel.getBrand;
        brand = brand.rows;
        layout_cache.set("brand",brand);
    }
    const checkClear = await checkCache.checkClear();
    if(checkClear.rows[0].action){
        product_cache.reset();
        filter_cache.reset();
        checkCache.setClear();
    }
    res.locals.coupons = coupons;
    res.locals.tags=tag;
    res.locals.brands=brand;
    res.locals.categories = category_nav;
    next();
}