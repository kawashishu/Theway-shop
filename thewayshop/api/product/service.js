const pool = require('../../models/dbconnect/dbconnect')

const limit = 9;
exports.addRating = (user_id,product_id,star,content)=>{
    return pool.query(
        `INSERT INTO rating(user_id,product_id,star,content)
        VALUES ($1,$2,$3,$4) RETURNING *;`,[user_id,product_id,star,content]
    )
}


exports.userInfo = (user_id)=>{
    return pool.query(
        `SELECT name,image FROM users
        WHERE id = $1`,[user_id]
    )
}

exports.getRating = (product_id,page)=>{
    return pool.query(
        `SELECT name,image,star,content FROM rating,users
        WHERE product_id=$1
        AND user_id = users.id
        ORDER BY rating.create_at DESC
        LIMIT $2 OFFSET $3;`,[product_id,limit,(page-1)*limit]
    )
}

exports.getAll = (page,sqlOrder)=>{
    return pool.query(
        `SELECT id,title,description,price,image,state,brand FROM product
        WHERE is_delete = 'f'
        `+sqlOrder+`
        LIMIT $1 OFFSET $2;`,[limit,(page-1)*limit]
    )
}
exports.getTagPro = (tag_name, page,sqlOrder)=>{
    return pool.query(
        `SELECT product.id,title,description,price,image,state,brand FROM product,tag
        WHERE tag.name = $1
        AND product.is_delete = 'f'
        AND product.tag_id = tag.id
        `+sqlOrder+`
        LIMIT $2 OFFSET $3;`,[tag_name, limit,(page-1)*limit]
    )
}

exports.getCatePro = (cate_name,page,sqlOrder)=>{
    return pool.query(
        `SELECT product.id,title,description,price,image,state,brand FROM product,tag_category,category
        WHERE category.name = $1
        AND product.is_delete = 'f'
        AND tag_category.category_id = category.id
        AND tag_category.tag_id=product.tag_id
        `+sqlOrder+`
        LIMIT $2 OFFSET $3;`,[cate_name, limit,(page-1)*limit]
    )
}

exports.getComment = (product_id,page)=>{
    return pool.query(
        `SELECT user_name,content FROM comment
        WHERE product_id=$1
        ORDER BY create_date DESC
        LIMIT $2 OFFSET $3;`,[product_id,limit,(page-1)*limit]
    )
}

exports.addComment = (user_name,product_id,content)=>{
    return pool.query(
        `INSERT INTO comment(user_name,product_id,content)
        VALUES ($1,$2,$3) RETURNING *;`,[user_name,product_id,content]
    )
}

exports.searchProduct = (q,page) => {
    return pool.query(
        `sELECT * FROM product WHERE lower(title) ~ lower($1) AND is_delete = 'f' LIMIT 9 OFFsET $2`, [q,(page-1)*9]
    )

}

exports.searchFilter_popu = (q,page) => {
    return pool.query(
        `select * from product where is_delete = 'f' order by available desc limit $1 offset $2`, [limit,(page-1)*limit]
    )

}
exports.searchFilter_high = (q,page) => {
    return pool.query(
        `select * from product order by price desc limit $1 offset $2`, [limit,(page-1)*limit]
    )

}
exports.searchFilter_low = (q,page) => {
    return pool.query(
        `select * from product order by price asc limit $1 offset $2`, [limit,(page-1)*limit]
    )

}
exports.searchFilter_best = (q,page) => {
    return pool.query(
        `select * from product order by sold desc limit $1 offset $2`, [limit,(page-1)*limit]
    )

}
exports.searchProduct = (q,tag,brand,priceLow,priceHigh,page)=>{
    return pool.query(
        `SELECT product.id,title,description,price,image,state FROM product,tag
        WHERE lower(title) ~ lower($1)
        AND tag_id = tag.id
        AND tag.name ~ $2
        AND brand ~ $3
        AND price BETWEEN $4 AND $5
        LIMIT $6 OFFSET $7;`,[q,tag,brand,priceLow,priceHigh,8,(page-1)*8]
    )
}