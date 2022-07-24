
const e = require('express');
const service = require('./service');

const view = '../component/table/view/';
exports.viewTable = async function(req, res) {
  const {tb_name} = req.params;
  const page = parseInt(req.query.page)||1;
  let record=undefined;
  console.log(tb_name);
  if(tb_name ==="tag"){
    record = await service.getTagRecord(page);
  }
  else if(tb_name==="category"){
    record = await service.getCateRecord(page);
  }
  else{
    return res.render('error');
  }
  let max_page = await service.maxPage(tb_name);
  max_page = parseInt(max_page.rows[0].max_page);
  return res.render(view+'table',{
    title:`Data for table ${tb_name}`,
    table_name:tb_name,
    record: record.rows,
    table_active:true,
    page:page,
    next:page<max_page?page+1 : false,
    pages:Array.from({length: max_page}, (v, k) => k+1),
    previous:page>1?page-1:false
  })

};

exports.editTable = async (req,res)=>{

  const {tb_name} = req.params;
  const {recordId}= req.query;
  const data = await service.recordData(tb_name,recordId);
  let cate = "";
  if(tb_name==="tag"){
    cate = await service.getCateRecord(1);
  }
  
  delete (await data).rows[0].id;
  res.render(view+'editpage',{
    title:`Edit table ${tb_name}`,
    table_name:tb_name,
    cate:cate.rows,
    record_id:recordId,
    record:data.rows[0],
    table_active:true
  })
}

exports.postEditTable = async(req,res)=>{
  const tb_name = req.params.tb_name;
  const record_id = req.query.recordId;
  if(tb_name=== "tag"){
    const {name, category} = req.body;
    await service.updateTag(record_id,name);
    await service.updateTagToCate(record_id,category);
  }
  else if(tb_name==="category"){
    const {name} = req.body;
    await service.updateCate(record_id,name);
  }
  res.redirect(`/table/${table_name}/edit?recordId=${record_id}`);
}