
const service = require('./service');

const view = '../component/orders/view/';
exports.viewOrders = async function(req, res) {

  const page = parseInt(req.query.page)||1;
  const record = await service.getAllRecord(page);
  let max_page = await service.maxPage();
  max_page = parseInt(max_page.rows[0].max_page);
  return res.render(view+'orders',{
    title:`Data for orders`,
    record: record.rows,
    order_active:true,
    page:page,
    next:page<max_page?page+1 : false,
    pages:Array.from({length: max_page}, (v, k) => k+1),
    previous:page>1?page-1:false
  })

};
exports.viewOrder = async function(req, res) {

  const {recordId}= req.query;
  const page = parseInt(req.query.page)||1;
  const data = await service.recordOrder(page, recordId);
  let max_page = await service.maxPage('orders');
  max_page = parseInt(max_page.rows[0].max_page);
  res.render(view+'order_view',{
    title:`Data for order`,
    table_name:`orders`,
    record: data.rows,
    order_active:true,
    page:page,
    next:page<max_page?page+1 : false,
    pages:Array.from({length: max_page}, (v, k) => k+1),
    previous:page>1?page-1:false
  })

};
exports.editOrders = async (req,res)=>{

  const {recordId}= req.query;
  const data = await service.recordData('orders',recordId);
  
  delete (await data).rows[0].id;
  res.render(view+'edit_orders',{
    title:`Edit table Orders}`,
    table_name:`orders`,
    record_id:recordId,
    record:data.rows[0],
    order_active:true
  })
}