const pool = require('../../models/dbconnect/dbconnect')
const limit = 9;
exports.getProImage = (product_id)=>{
    return pool.query(
        `SELECT image FROM product_image
        WHERE product_id=$1`,[product_id]
    )
}

exports.getAll = (page)=>{
    return pool.query(
        `SELECT id,title,description,price,image,state FROM product
        WHERE is_delete = 'f'
        ORDER BY create_date DESC
        LIMIT $1 OFFSET $2;`,[limit,(page-1)*limit]
    )
}

exports.getTagId = (tag_name)=>{
    return pool.query(
        `SELECT id FROM tag
        WHERE name=$1`,[tag_name]
    )
}
exports.getCateId = (cate_name)=>{
    return pool.query(
        `SELECT id FROM category
        WHERE name=$1`,[cate_name]
    )
}

exports.maxPageTag = (tag_name)=>{
    return pool.query(
        `SELECT ceil(COUNT(*)/$1::numeric) as max_page FROM product,tag WHERE tag_id=tag.id AND tag.name=$2 AND is_delete = 'f';`,[limit,tag_name]
    )
}
exports.maxPageCate = (cate_name)=>{
    return pool.query(
        `SELECT ceil(COUNT(*)/$1::numeric) as max_page FROM product,tag_category,category 
        WHERE category.name = $2
        AND tag_category.category_id=category.id
        AND tag_category.tag_id = product.tag_id
        AND is_delete = 'f';`,[limit,cate_name]
    )
}

exports.getTagPro = (tag_name, page)=>{
    return pool.query(
        `SELECT product.id,title,description,price,image,state FROM product,tag
        WHERE tag.name = $1
        AND product.is_delete = 'f'
        AND product.tag_id = tag.id
        ORDER BY product.create_date DESC
        LIMIT $2 OFFSET $3;`,[tag_name, limit,(page-1)*limit]
    )
}

exports.getCatePro = (cate_name,page)=>{
    return pool.query(
        `SELECT product.id,title,description,price,image,state FROM product,tag_category,category
        WHERE category.name = $1
        AND product.is_delete = 'f'
        AND tag_category.category_id = category.id
        AND tag_category.tag_id=product.tag_id
        ORDER BY create_date DESC
        LIMIT $2 OFFSET $3;`,[cate_name, limit,(page-1)*limit]
    )
}

exports.getRecent = pool.query(
    `SELECT id,title,price,image,state FROM product
    WHERE is_delete = 'f'
    ORDER BY create_date DESC
    LIMIT 4;`
)
exports.getOne = (product_id)=>{
    return pool.query(
        `SELECT product.*,tag.name as tag_name, category.name as cate_name 
        FROM product,tag,tag_category,category
        WHERE product.id =$1 
        AND product.tag_id=tag.id 
        AND tag.id=tag_category.tag_id 
        AND tag_category.category_id= category.id;`,[product_id]
    )
}

exports.getBrand = pool.query(
    `SELECT DISTINCT brand FROM product;`
)
exports.maxPage = pool.query(
    `SELECT ceil(COUNT(*)/$1::numeric) as max_page FROM product WHERE is_delete = 'f';`,[limit]
)

exports.getRelate = (pro_id)=>{
    return pool.query(
        `SELECT id,title,description,price,image,state FROM product 
        WHERE id IN (SELECT product_id FROM order_product 
                    WHERE order_id IN (SELECT order_id FROM order_product 
                                        WHERE product_id=$1) 
                    EXCEPT SELECT product_id FROM order_product 
                    WHERE product_id=$1)
        AND is_delete = 'f';`,[pro_id]
    )
}

exports.numberRating = (product_id)=>{
    return pool.query(
        `SELECT COUNT(*) as max_rating FROM rating WHERE product_id=$1;`,[product_id]
    )
}

exports.numerComment = (product_id)=>{
    return pool.query(
        `SELECT COUNT(*) as max_comment FROM comment WHERE product_id=$1;`,[product_id]
    )
}

exports.countProduct = pool.query(
    `SELECT COUNT(*) FROM product;`
)
exports.countProductTag = (tag_name)=>{
    return pool.query(
        `SELECT COUNT(*) FROM tag,product WHERE tag.id = product.tag_id AND tag.name=$1 AND is_delete = 'f';`,[tag_name]
    )
}

exports.countProductCate = (cate_name)=>{
    return pool.query(
        `SELECT COUNT(*) FROM category, tag_category, product 
        WHERE category.id=tag_category.category_id
        AND tag_category.tag_id = product.tag_id
        AND category.name=$1
        AND is_delete = 'f';`,[cate_name]
    )
}

exports.getAllMostCost = pool.query(
    `SELECT MAX(price) FROM product;`
)
exports.getTagMostCost = (tag_name)=>{
    return pool.query(
        `SELECT MAX(price) FROM product,tag WHERE tag_id=tag.id AND tag.name=$1;`,[tag_name]
    )
}
exports.getCateMostCost = (cate_name)=>{
    return pool.query(
        `SELECT MAX(price) FROM product,tag_category,category 
        WHERE product.tag_id=tag_category.tag_id
        AND tag_category.category_id = category.id
        AND category.name= $1;`,[cate_name]
    )
}