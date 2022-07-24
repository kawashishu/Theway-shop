const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const passport = require('../../config/passport');
const service = require('./service');
const {registerValid} = require('../../helper/joiValidation');
const sendEmail = require('../../helper/sendEmail');

const view = '../component/auth/view/';

exports.login = async (req,res)=>{
    res.render(view+'login', { 
        title: 'Login', 
        error: req.query.error?"Invalid email or password":""
    })
}

exports.auth = passport.authenticate('local', { 
    successRedirect: '/',
    failureRedirect: '/login?error=true'
});

exports.getRegister = (req,res)=>{
    res.render(view+'login', { 
        title: 'Register', 
        register:true,
        error: req.query.error?"Invalid email or password":""
    })
}

exports.verify = async (req,res,next)=>{
    const {email} = req.body;
    const user = await service.findOne(email);
    if(user.rows.length > 0){
        if(user.rows[0].verified){
            next();
        }
        else{
            res.render(view+'login',{
                title:'Login',
                verify:'Please verify your email',
                email:email
            })
        }
    }
    else{
        res.render(view+'login',{
            title:'Login',
            error:'Invalid email or password'
        })
    }
}

exports.register = async(req,res)=>{
    const {error} = registerValid(req.body);
    if(error){ 
        return res.render(view+'login', { 
            title: 'Register', 
            register:true,
            error:'Sign up not success :'+ error.details[0].message
        })
    }
    const {email,password,name,birthday,address}= req.body;
    const hashedpassword = await bcrypt.hash(password,10);
    try{
        const user_id =  await service.register(email,hashedpassword,name,birthday,address);
        const baseurl =  req.protocol + '://' + req.get('host') + '/confirmation/';
        sendEmail(user_id.rows[0].id,email,baseurl)
        return res.render(view+'login', { 
            title: 'Login', 
            message: 'Sign up success, please verify your email.'
        })
    }
    catch(err){
        return res.render(view+'login', { 
            title: 'Register', 
            register:true,
            error:err
        })
    }
}

exports.logout = (req,res)=>{
    req.logout();
    res.redirect('/');
}

exports.confirm = async (req,res)=>{
    try{
        const {id} = jwt.verify(req.params.token,process.env.JWT_SECRET);
        await service.confirm(id);
        res.redirect('/login')
    }   
    catch(e){
        res.send('error');
    }

}
exports.changepass = async (req,res)=>{
    try{
        const {id} = jwt.verify(req.params.token,process.env.JWT_SECRET);
        
        res.render(view+'changepass',{
            title:'Forgot password'
        })
    }   
    catch(e){
        res.send('error');
    }

}
exports.postChangepass = async (req,res)=>{
    try{
        const {id} = jwt.verify(req.params.token,process.env.JWT_SECRET);
        const {password,repassword} = req.body;
        if(password != repassword){
            return res.render(view+'changepass',{
                title:'Forgot password'
            });
        }
        const hashedpassword = await bcrypt.hash(password,10);
        console.log(hashedpassword);
        try{
            await service.changepass(id,hashedpassword);
            return res.redirect('/login');
        }
        catch(e){
            console.log(e);
            return res.render(view+'changepass',{
                title:'Forgot password'
            })
        }
    }   
    catch(e){
        res.send('Token had expired');
    }

}