
const bcrypt = require('bcrypt');

const managerService = require('./service')

const view = '../component/manager/view/';

exports.profile = async(req,res)=>{


    const manager = await managerService.findOne(req.user.id);


    res.render(view+'/profile',{
        title:"Manager",
        manager:manager.rows[0]
    })
}
exports.postSave = async(req,res)=>{
    const {fullname, birthday, salary} = req.body;
    await managerService.edit(req.user.id,fullname, birthday, salary)
    res.redirect('/profile')
}

exports.manager = async(req,res)=>{


    const page =  Math.max(parseInt(req.query.page)||1,1);
    let max_page = await managerService.maxPage;
    max_page = max_page.rows[0].max_page||1;
    const managers = await managerService.allManager(page)

    res.render(view+'manager',{
        title:"Manager",
        managers:managers.rows,
        page:page,
        next:page<max_page?page+1 : false,
        pages:Array.from({length: max_page}, (v, k) => k+1),
        previous:page>1?page-1:false,
        manager_active:true
    })
}
exports.getAdd = async(req,res)=>{

    const manager ={
        username:'username',
        password:'password',
        fullname:'full name',
        birthday:'Birth day',
        image:'avatar',
        salary:'salary'
    }

    res.render(view+'addmanager',{
        title:"Add Manager",
        manager:manager
    })
}

exports.postAdd = async(req,res)=>{


    const {username,password,fullname,birthday,image,salary} = req.body;

    const checkValid = await managerService.findOneUsername(username);
    if(checkValid.rows > 0){
        return res.render(view+'addmanager',{
            title:"Add Manager",
            manager:manager,
            message:"Username already exist, choose another one" 
        })
    }

    const hashpassword = await bcrypt.hash(password,10);
    try {
        await managerService.add(username,hashpassword,fullname,birthday,image,salary);
        res.redirect('/manager');
    }
    catch(err){
        return res.render(view+'addmanager',{
            title:"Add Manager",
            manager:manager,
            error:err.routine 
        })
    }

}