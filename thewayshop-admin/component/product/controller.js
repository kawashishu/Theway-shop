const productModel = require('../../models/product');
const {productCache} = require('../../config/lruCache');
const service = require('./service')
const view = '../component/product/view/';

exports.get = async (req,res)=>{
    const page = Math.max(parseInt(req.query.page)||1,1);

    let max_page = productCache.get(`product_maxpage`);
    if(!max_page){
        const getMaxPage = await productModel.maxPage;
        max_page = getMaxPage.rows[0].max_page;
        productCache.set(`product_maxpage`,max_page);
    }
    let product_page = productCache.get(`product_page${page}`);
    if(!product_page){
        const products = await productModel.getAll(parseInt(page));
        product_page = products.rows;
        productCache.set(`product_page${page}`,product_page);
    }
    

    res.render(view+'productpage', { 
        title: 'TheWayShop Product',
        head:'All Product',
        products:product_page,
        page:page,
        max_page:max_page,
        next:page<max_page?page+1 : false,
        pages:Array.from({length: max_page}, (v, k) => k+1),
        previous:page>1?page-1:false,
        product_active:true
    });
}
exports.getProduct = async (req,res)=>{

    try{
        const {product_id} = req.params;
        const product = await productModel.getOne(product_id);
        const taglist = await service.getTag;
        const subimage = await service.getSubImage(product_id);
        if(subimage.rows.length === 0){
            const temp = [
                {
                    'image':''
                },
                {
                    'image':''
                }
            ];
            subimage.rows = temp;
        }
        res.render(view+'productEdit', { 
            title: product.rows[0].title,
            product:product.rows[0],
            tagList:taglist.rows,
            subimage:subimage.rows,
            product_active:true
        });
    }
    catch(err){
        console.log(err);
        res.render('error');
    }
    
}

exports.postProduct = async (req,res)=>{
    const {title,description,price,image,brand,tag_id,available} = req.body;
    try{
        await service.updatePro(req.params.product_id,title,description,price,image,brand,tag_id,available);
        res.redirect(`/product/${req.params.product_id}`)
    }
    catch(err){
        console.log(err);
        const product = await productModel.getOne(product_id);
        res.render(view+'productEdit', { 
            title: product.rows[0].title,
            product:product.rows[0],
            message:'Update faile:'+err.routine,
            product_active:true
        });
    }
}

exports.getAddProduct = async (req,res)=>{

    const product = {
        title:'product name',
        description:'some thing to say about the product',
        price:'price of the product',
        image:'product image',
        brand:'Brand of the product',
        tag_id:'Id of 1 of the tag',
        available:'Have in store',
    }
    const tag = await service.getTag;
    res.render(view+'productAdd', { 
        title: 'New product',
        product:product,
        tag:tag.rows,
        product_active:true
    });
}

exports.postAddProduct = async(req,res)=>{
    const product = {
        title:'product name',
        description:'some thing to say about the product',
        price:'price of the product',
        image:'product image',
        brand:'Brand of the product',
        tag_id:'Id of 1 of the tag',
        available:'Have in store',
    }
    try{
        const {title,description,price,image,subimage,brand,tag_id,available} = req.body;
        const subimg_arr = JSON.parse(subimage);
        const newProId = await service.addPro(title,description,price,image,brand,tag_id,available);
        for await(const img of subimg_arr){
            await service.addSubImage(newProId.rows[0].id,img)
        }
        service.setClearCache();
        res.render(view+'productAdd', { 
            title: 'New product',
            product:product,
            message:'Add success',
            new_pro_id:newProId.rows[0].id,
            product_active:true
        });
    }
    catch(err){
        console.log(err);
        res.render(view+'productAdd', { 
            title: 'New product',
            product:product,
            error:err.detail,
            product_active:true
        });
    }
}

exports.searchProduct = async (req,res)=>{

    let {q,page} = req.query;
    page = Math.max(parseInt(page)||1,1);

    let max_page = await productModel.countName(q);
    max_page = max_page.rows[0].max_page;
    if(page>parseInt(max_page)){
        page=max_page;
    }
    res.render(view+'productpage',{
        title: 'Search',
        head : 'Search : '+q,
        product_active:true,
        q:q,
        page:page,
        max_page:max_page,
        product_active:true
    })
}

exports.delete = async(req,res)=>{
    const {id} = req.params;
    if(!id) throw false;

    await productModel.delete(id);
    service.setClearCache();
    productCache.reset();
    res.redirect('/product')
}