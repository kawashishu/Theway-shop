const service = require('./service');
const view = '../component/users/view/';

exports.viewTable = async function(req, res) {

    const page = parseInt(req.query.page)||1;
    const column_name = ["User Id", "Email", "Name", "Address", "Balance","Total Orders", "Total Expend"];
    const record = await service.getRecord(page, 'user');
    let max_page = await service.maxPage('user');
    max_page = parseInt(max_page.rows[0].max_page);

    return res.render(view+'usertable',{
      title:"User",
      table_name:"User",
      column_name:column_name,
      record: record.rows,
      user_active:true,
      page:page,
      next:page<max_page?page+1 : false,
      pages:Array.from({length: max_page}, (v, k) => k+1),
      previous:page>1?page-1:false
    })
};

exports.postBlock = async (req,res)=>{
  const {recordId}= req.query;
  const {recordBlock}= req.query;
  // try {
  //   await service.block(recordId,recordBlock);
  // } catch (error) {
  //   console.log(error);
  // }
  
  res.redirect('/user')
}

exports.getUserInfo = async(req, res) => {
  const {recordId}= req.query;

  const data = await service.recordData(recordId);

  return res.render(view+'infouser',{
    title:"User",
    record: data.rows[0]
  })
}
exports.returnUser = async(req, res) => {
  res.redirect('/user')
}