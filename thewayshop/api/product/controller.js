const {
  product_cache,
  filter_cache,
  rating_cache,
  comment_cache,
} = require("../../helper/lruCache");

const service = require("./service");

exports.getRating = async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const product_id = req.query.proid;
  let rating_page = rating_cache.get(`${product_id}_page${page}`);
  if (!rating_page) {
    try {
      const rating = await service.getRating(product_id, page);
      rating_page = rating.rows;
      rating_cache.set(`${product_id}_page${page}`, rating_page);
    } catch (e) {
      return res.status(400).json(e);
    }
  }
  res.status(200).json(rating_page);
};

exports.postRating = async (req, res) => {
  if (!req.user) {
    res.status(400).json({ error: "login required" });
  }
  const user_id = req.user.id;
  const { product_id, star, content } = req.body;
  try {
    const rating = await service.addRating(user_id, product_id, star, content);
    let page = 1;
    while (rating_cache.get(`${product_id}_page${page}`)) {
      rating_cache.set(`${product_id}_page${page}`, undefined);
      page++;
    }
    res.status(200).json(rating.rows[0]);
  } catch (e) {
    res.status(400).json(e);
  }
};

exports.getProduct = async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const sortBy = req.query.sort_by;
  let sqlOrder ='';
  switch (sortBy){
    case 'nothing':
      sqlOrder = 'ORDER BY create_date DESC';
      break;
    case 'price-asc':
      sqlOrder='ORDER BY price ASC';
      break;
    case 'price-desc':
      sqlOrder='ORDER BY price DESC';
      break;
    case 'best-seller':
      sqlOrder='ORDER BY sold DESC';
      break;
    default:
      sqlOrder = 'ORDER BY create_date DESC';
      break;
  }
  let product_page = product_cache.get(`product_${sortBy}_page${page}`);
  if (!product_page) {
    try {
      const products = await service.getAll(page,sqlOrder);
      product_page = products.rows;
      product_cache.set(`product_${sortBy}_page${page}`, product_page);
    } catch (e) {
      console.log(e);
      return res.status(500).json(e);
    }
  }
  res.status(200).json(product_page);
};

exports.filterTag = async (req, res) => {
  const tag_name = req.params.tag_name;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const sortBy = req.query.sort_by;
  let sqlOrder ='';
  switch (sortBy){
    case 'nothing':
      sqlOrder = 'ORDER BY create_date DESC';
      break;
    case 'price-asc':
      sqlOrder='ORDER BY price ASC';
      break;
    case 'price-desc':
      sqlOrder='ORDER BY price DESC';
      break;
    case 'best-seller':
      sqlOrder='ORDER BY sold DESC';
      break;
    default:
      sqlOrder = 'ORDER BY create_date DESC';
      break;
  }
  let product_page = filter_cache.get(`${tag_name}_${sortBy}_page${page}`);
  if (!product_page) {
    try {
      const products = await service.getTagPro(tag_name, page,sqlOrder);
      product_page = products.rows;
      filter_cache.set(`${tag_name}_page${page}`, product_page);
    } catch (e) {
      return res.status(500).json(e);
    }
  }
  return res.status(200).json(product_page);
};
exports.filterCategory = async (req, res) => {
  const cate_name = req.params.category_name;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const sortBy = req.query.sort_by;
  let sqlOrder ='';
  switch (sortBy){
    case 'nothing':
      sqlOrder = 'ORDER BY create_date DESC';
      break;
    case 'price-asc':
      sqlOrder='ORDER BY price ASC';
      break;
    case 'price-desc':
      sqlOrder='ORDER BY price DESC';
      break;
    case 'best-seller':
      sqlOrder='ORDER BY sold DESC';
      break;
    default:
      sqlOrder = 'ORDER BY create_date DESC';
      break;
  }
  let product_page = filter_cache.get(`${cate_name}_${sortBy}_page${page}`);
  if (!product_page) {
    try {
      const products = await service.getCatePro(cate_name, page,sqlOrder);
      product_page = products.rows;
      filter_cache.set(`${cate_name}_${sortBy}_page${page}`, product_page);
    } catch (e) {
      return res.status(500).json(e);
    }
  }
  return res.status(200).json(product_page);
};

exports.getComment = async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const product_id = req.query.proid;
  let comment_page = comment_cache.get(`${product_id}_page${page}`);
  if (!comment_page) {
    try {
      const comment = await service.getComment(product_id, page);
      comment_page = comment.rows;
      comment_cache.set(`${product_id}_page${page}`, comment_page);
    } catch (e) {
      return res.status(400).json(e);
    }
  }
  res.status(200).json(comment_page);
};

exports.postComment = async (req, res) => {
  const { product_id, user_name, content } = req.body;
  try {
    const comment = await service.addComment(user_name, product_id, content);
    let page = 1;
    while (comment_cache.get(`${product_id}_page${page}`)) {
      comment_cache.set(`${product_id}_page${page}`, undefined);
      page++;
    }
    res.status(200).json(comment.rows[0]);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
};

exports.searchProduct = async (req, res) => {
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
  const result = await service.searchProduct(q,tag,brand,priceLow,priceHigh,page);

  res.json(result.rows);
};

