module.exports = (req,res,next)=>{
    if(!req.user){
        return res.redirect('/login');
    }
    res.locals.user = req.user;
    next();
}