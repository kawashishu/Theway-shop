const pool = require('./config/dbconnect')
const limit = 8;
exports.getAll = (page)=>{
    return pool.query(
        `SELECT id,title,price,image,available,sold FROM product
        WHERE is_delete = 'f'
        ORDER BY create_date DESC
        LIMIT $1 OFFSET $2;`,[limit,(page-1)*limit]
    )
}
exports.getRecent = pool.query(
    `SELECT id,title,price,image FROM product
    WHERE is_delete = 'f'
    ORDER BY create_date DESC
    LIMIT 4;`
)
exports.getOne = (product_id)=>{
    return pool.query(
        `SELECT * FROM product
        WHERE id=$1`,[product_id]
    )
}

exports.maxPage = pool.query(
    `SELECT ceil(COUNT(*)/$1::numeric) as max_page FROM product WHERE is_delete = 'f';`,[limit]
)



exports.addPro = (data)=>{
    const {title,description,price,image,brand,tag_id,available,sold} = data;
    return pool.query(
        `INSERT INTO product(title,description,price,image,brand,tag_id,available,sold)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,[title,description,price,image,brand,tag_id,available,sold]
    )
}

exports.searchName = (q,page)=>{
    const title = '%' + q.toLowerCase() +'%';
    return pool.query(
        `SELECT * FROM product 
        WHERE lower(title) LIKE $1
        AND is_delete = 'f'
        LIMIT $2 OFFSET $3;`,[title,limit,(page-1)*limit]
    )
}
exports.countName = (q)=>{
    const title = '%'+q.toLowerCase()+'%';
    return pool.query(
        `SELECT ceil(COUNT(*)/$1::numeric) as max_page 
        FROM product
        WHERE lower(title) LIKE lower($2)   
        AND is_delete = 'f';`,[limit,title]
    )
}

exports.delete = (id)=>{
    return pool.query(
        `UPDATE product
        SET is_delete = 't'
        WHERE id = $1`,[id]
    )
}
exports.getTopSellingProduct = pool.query(
    `select product.id,product.title,product.price,product.image, sum(order_product.quantity) as Max
    from product, order_product
    where product.is_delete = false and product.id = order_product.product_id
    group by product.id,product.title,product.price,product.image
    order by Max DESC 
    LIMIT 8`
)
exports.getTopSellingProductByTag = (id) => {
if(id == -1) 
return pool.query(
    `select product.id,product.title,tag.name,product.price,product.image, sum(order_product.quantity) as Max
    from product, order_product, tag
    where product.is_delete = false and product.id = order_product.product_id and product.tag_id = tag.id
    group by product.id,product.title,tag.name,product.price,product.image
    order by Max DESC 
    LIMIT 8`)
return pool.query(
    `select product.id,product.title,tag.name,product.price,product.image, sum(order_product.quantity) as Max
    from product, order_product, tag
    where product.is_delete = false and product.id = order_product.product_id and product.tag_id = $1 and product.tag_id = tag.id
    group by product.id,product.title,tag.name,product.price,product.image
    order by Max DESC 
    LIMIT 8`,[id]
)
}