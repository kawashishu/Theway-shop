
const tableModel = require('../models/table');
const chatModel = require('../models/chat');

module.exports = async(req,res,next)=>{
    
    const tables = ['tag','category'];
    const chat = await chatModel.getChat;
    res.locals.tables = tables;
    res.locals.chat = chat.rows;
    
    next();
}