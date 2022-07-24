const service = require('./service')

exports.block = async(req,res)=>{
    const {user_id,action} = req.body;
    try{
        if(action==='block'){
            await service.block(user_id)
            
        }
        else if(action ==='unblock'){
            await service.unblock(user_id)
        }
        return res.status(200).json({'user_id':user_id})
    }
    catch(err){
        console.log(err)
        return res.status(400).json(err)

    }
    
}