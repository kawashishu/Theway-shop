const pool = require('../../models/dbconnect/dbconnect')


const limit = 8;
exports.getRecent = ()=>{
    return pool.query(
        `SELECT id,title,price,image,state FROM product
        WHERE is_delete = 'f'
        AND state ='new'
        ORDER BY create_date DESC
        LIMIT $1;`,[limit]
    )
} 
exports.getTopSelling = ()=>{
    return pool.query(
        `SELECT id,title,price,image,state FROM product
        WHERE is_delete = 'f'
        AND state='top'
        ORDER BY sold DESC
        LIMIT $1;`,[limit]
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
        LIMIT $6 OFFSET $7;`,[q,tag,brand,priceLow,priceHigh,limit,(page-1)*limit]
    )
}
exports.countSearch = (q,tag,brand,priceLow,priceHigh)=>{
    return pool.query(
        `SELECT ceil(COUNT(*)/$6::numeric) as max_page FROM product,tag
        WHERE lower(title) ~ lower($1)
        AND tag_id = tag.id
        AND tag.name ~ $2
        AND brand ~ $3
        AND price BETWEEN $4 AND $5;`,[q,tag,brand,priceLow,priceHigh,limit]
    )
}