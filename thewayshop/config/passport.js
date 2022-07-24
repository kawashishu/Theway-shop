const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const authService = require('../component/auth/service');
passport.use(new LocalStrategy({
    usernameField:'email',
    passwordField:'password'
},
    async function(email, password, done) {
        try{
            const user = await authService.findOne(email);
            if (user.rows.length<1) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            console.log(user.rows[0].is_delete)
            if(user.rows[0].is_delete){
                return done(null, false, { message: 'Account is blocked.' });
            }
            const match = await validPassword(user.rows[0],password);
            if (!match) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user.rows[0]);
        }
        catch(err){
            console.log(err);
            return done(err);
        }
        
    }
));

passport.serializeUser(function(user, done) {
    done(null, {id:user.id,name:user.name});
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});


async function validPassword(user,password){
    return  bcrypt.compare(password,user.password);
}

module.exports = passport;