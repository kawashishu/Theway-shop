const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const authService = require('../component/auth/service');
passport.use(new LocalStrategy(
    async function(username, password, done) {
        try{
            const user = await authService.findOne(username);
            if (user.rows.length<1) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            const match = await validPassword(user.rows[0],password);
            if (!match) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            else{
                return done(null, user.rows[0]);
            }
        }
        catch(err){
            console.log(err);
            return done(err);
        }
        
    }
));

passport.serializeUser(function(user, done) {
    done(null, {id:user.id,username:user.fullname,image:user.image});
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

function validPassword(user,password){
    return bcrypt.compare(password,user.password);
}

module.exports = passport;