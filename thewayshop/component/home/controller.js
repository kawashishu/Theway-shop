
const service = require('./service')
const view = '../component/home/view/'
const {layout_cache} = require('../../helper/lruCache');
exports.homePage = async (req,res)=>{
    const recent_pro = await service.getRecent();
    const top_pro = await service.getTopSelling();
    res.render(view+'index', { 
        title: 'The Way Shop', 
        recent_product: recent_pro.rows,
        top_pro:top_pro.rows
      });
}

exports.search = async(req,res)=>{
  let {q,tag,brand,price} = req.query;
  let page = Math.max(parseInt(req.query.page)||1,1);
  if(!q){
    q='';
  }
  if(!tag){
    tag=''
  }
  if(!brand){
    brand='';
  }

  const priceLow = parseInt(price.split('-')[0].slice(1));
  const priceHigh = parseInt(price.split('-')[0].slice(2));
  const maxPage = await service.countSearch(q,tag,brand,priceLow,priceHigh);
  if(page > parseInt(maxPage.rows[0].max_page)){
    page=parseInt(maxPage.rows[0].max_page)
  }
  return res.render(view+'search',{
    title:'Search',
    max_page:maxPage.rows[0].max_page,
    page:page
  });
}