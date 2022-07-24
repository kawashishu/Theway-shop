const {product_cache,filter_cache} = require('../../helper/lruCache'); 
const view = '../component/product/view/'

const service = require('./service');

exports.mainPage = async(req,res)=>{
    
    let page = Math.max(parseInt(req.query.page)||1,1);
    let max_page = product_cache.get('max_product_page');
    try{
        if(!max_page){
            let max_page_data = await service.maxPage;
            max_page = parseInt(max_page_data.rows[0].max_page);
            product_cache.set('max_product_page',max_page);
        }
        if(page>max_page){
            page=max_page;
        }
        const total_product = await service.countProduct;
        const maxCost = await service.getAllMostCost;
        res.render(view+'productList', { 
            title: 'All Product', 
            page:page,
            max_cost:maxCost.rows[0].max,
            total_product: total_product.rows[0].count,
            max_page:max_page,
            next:page<max_page?page+1 : false,
            pages:Array.from({length: max_page}, (v, k) => k+1),
            previous:page>1?page-1:false
          });
    }
    catch(e){
        console.log(e);
        res.redirect('/product');
    }
    
}

exports.proDetail = async (req,res)=>{

    const pro_id = req.params.product_id;
    try{
        const product = await service.getOne(pro_id);
        const relate = await service.getRelate(pro_id);
        const pro_image = await service.getProImage(pro_id);
        const numberRating = await service.numberRating(pro_id);
        const numberComment = await service.numerComment(pro_id);
        res.render(view+'productDetail',{
            title: product.rows[0].title, 
            product:product.rows[0],
            products:relate.rows,
            number_rating:numberRating.rows[0].max_rating,
            number_comment:numberComment.rows[0].max_comment,
            pro_image:pro_image.rows
        })
    }
    catch(err){
        res.render('error');
    }
    
}

exports.filterCategory = async (req,res)=>{
   
    const cate_name = req.params.category_name;
    let page = Math.max(parseInt(req.query.page)||1,1);

    let max_page = filter_cache.get(`${cate_name}_max_page`);
    if(!max_page){
        let max_page_data = await service.maxPageCate(cate_name);
        max_page = max_page_data.rows[0].max_page;
        filter_cache.set(`${cate_name}_max_page`,max_page);
    }
    if(page>max_page){
        page=max_page
    }
    const total_product = await service.countProductCate(cate_name);
    const maxCost = await service.getCateMostCost(cate_name);
    res.render(view+'productList', { 
        title: cate_name, 
        max_cost:maxCost.rows[0].max,
        total_product:total_product.rows[0].count,
        page:page,
        max_page:max_page,
        next:page<max_page?page+1 : false,
        pages:Array.from({length: max_page}, (v, k) => k+1),
        previous:page>1?page-1:false
      });
}

exports.filterTag = async (req,res)=>{
    const tag_name = req.params.tag_name;
    let page = Math.max(parseInt(req.query.page)||1,1);

    let max_page = filter_cache.get(`${tag_name}_max_page`);
    if(!max_page){
        let max_page_data = await service.maxPageTag(tag_name);
        max_page = max_page_data.rows[0].max_page;
        filter_cache.set(`${tag_name}_max_page`,max_page);
    }
    if(page>max_page){
        page=max_page;
    }
    const total_product = await service.countProductTag(tag_name);
    const maxCost = await service.getTagMostCost(tag_name);
    res.render(view+'productList', { 
        title: tag_name, 
        max_cost:maxCost.rows[0].max,
        total_product:total_product.rows[0].count,
        page:page,
        max_page:max_page,
        next:page<max_page?page+1 : false,
        pages:Array.from({length: max_page}, (v, k) => k+1),
        previous:page>1?page-1:false
      });
}