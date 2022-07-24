const passport = require("../../passport/passportConfig");


const view = '../component/auth/view/';

exports.loginGet = (req,res)=>{
    return res.render(view+'login',{
        layout:false,
        title:'Login',
        message: req.query.error?'Invalid email or password':false
    });
}

exports.loginPost = passport.authenticate('local', { 
                                successRedirect: '/',
                                failureRedirect: '/login?error=true',
                                failureMessage:'Wrong email or password'
                            });

exports.logout = (req,res)=>{
    req.logout();
    res.redirect('/login');
}

