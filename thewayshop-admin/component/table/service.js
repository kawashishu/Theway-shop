const pool = require('../../models/config/dbconnect');
const limit = 9;
exports.getColumnName= (tb_name)=>{
    return pool.query(
        `SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = '`+tb_name+`';`
    );
}

exports.getAllRecord = (tb_name)=>{
    return pool.query(
        `SELECT * FROM ${tb_name};`
      )
}

exports.recordData = (tb_name,record_id)=>{
    return pool.query(
        `SELECT * FROM   ${tb_name}  WHERE id =$1;`,[record_id]
    )
}
exports.maxPage = (tb_name)=> {
    return pool.query(
        `SELECT ceil(COUNT(*)/$1::numeric) as max_page FROM ${tb_name};`,[limit]
    )
}
exports.getRecord = (page, tb_name)=>{
    return pool.query(
        `SELECT * FROM ${tb_name}
        LIMIT $1 OFFSET $2;`,[limit,(page-1)*limit]
      )
}

exports.getTagRecord = (page)=>{
    return pool.query(
        `SELECT tag.*, category.name as category FROM tag,tag_category,category WHERE tag_category.category_id=category.id AND tag_category.tag_id=tag.id LIMIT $1 OFFSET $2;`,[limit,(page-1)*limit]
    )
}
exports.getCateRecord = (page)=>{
    return pool.query(
        `SELECT *  FROM category LIMIT $1 OFFSET $2;`,[limit,(page-1)*limit]
    )
}

exports.updateTag = (id,name)=>{
    return pool.query(
        `UPDATE tag SET name = $1 WHERE id =$2;`,[name,id]
    )
}
exports.updateTagToCate = (tag_id,cate_id)=>{
    return pool.query(
        `UPDATE tag_category SET category_id=$1 WHERE tag_id=$2;`,[cate_id,tag_id]
    )
}
exports.updateCate = (id,name)=>{
    return pool.query(
        `UPDATE cate SET name = $1 WHERE id =$2;`,[name,id]
    )
}