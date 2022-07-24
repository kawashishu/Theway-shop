const pool = require('./dbconnect/dbconnect');

exports.getAll = (limit)=>{
    return pool.query(
        `SELECT * FROM tag LIMIT $1;`,[limit]
    )
}


exports.getTagCate = (cate_id,limit)=>{
    return pool.query(
        `SELECT tag.* FROM tag,tag_category 
        WHERE tag_category.category_id = $1
        AND tag.id= tag_category.tag_id
        LIMIT $2;`,[cate_id,limit]
    )
}