const pool = require('./dbconnect/dbconnect')
const limit = 9;
exports.getAll = (page)=>{
    return pool.query(
        `SELECT id,title,description,price,image,state FROM product
        WHERE is_delete = 'f'
        ORDER BY create_date DESC
        LIMIT $1 OFFSET $2;`,[limit,(page-1)*limit]
    )
}
exports.getTagPro = (tag_id, page)=>{
    return pool.query(
        `SELECT id,title,description,price,image,state FROM product
        WHERE is_delete = 'f'
        AND tag_id = $1
        ORDER BY create_date DESC
        LIMIT $2 OFFSET $3;`,[tag_id, limit,(page-1)*limit]
    )
}
exports.getCatePro = (cate_id,page)=>{
    return pool.query(
        `SELECT id,title,description,price,image,state FROM product,tag_category
        WHERE product.is_delete = 'f'
        AND tag_category.category_id = $1
        AND tag_category.tag_id=product.tag_id
        ORDER BY create_date DESC
        LIMIT $2 OFFSET $3;`,[cate_id, limit,(page-1)*limit]
    )
}

exports.getRecent = pool.query(
    `SELECT id,title,price,image,state FROM product
    ORDER BY create_date DESC
    LIMIT 4;`
)
exports.getOne = (product_id)=>{
    return pool.query(
        `SELECT * FROM product
        WHERE id=$1`,[product_id]
    )
}

exports.getBrand = pool.query(
    `SELECT DISTINCT brand FROM product;`
)
exports.maxPage = pool.query(
    `SELECT ceil(COUNT(*)/$1::numeric) as max_page FROM product;`,[limit]
)

exports.getRelate = (pro_id,tag_id,brand)=>{
    return pool.query(
        `SELECT id,title,description,price,image,state FROM product
        WHERE (tag_id=$1
        OR brand=$2)
        AND id <> $3
        AND is_delete = 'f'
        LIMIT 8;`,[tag_id,brand,pro_id]
    )
}
