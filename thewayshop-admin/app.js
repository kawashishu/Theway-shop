const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const exphbs = require('express-handlebars');
const dotenv = require('dotenv');
const session = require('express-session');
dotenv.config();
const passport = require('./passport/passportConfig');

const indexRouter = require('./component/dashboard/route');
const authRouter = require('./component/auth/route')
const tableRouter = require('./component/table/route');
const productRouter = require('./component/product/route');
const managerRouter = require('./component/manager/route');
const userRouter = require('./component/users/route');
const ordersRouter = require('./component/orders/route');
const apiRouter = require('./api/route');

const verify = require('./middleware/verifyUser')
const addTableMess = require('./middleware/setTableMess');
const app = express();

// view engine setup
app.engine('hbs',exphbs({ 
  defaultLayout: 'layout',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layout'),
  partialsDir : path.join(__dirname, 'views/partials'),
  helpers: require('./config/hbsHelper')

}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: process.env.SESSION_SECRET, resave:false,saveUninitialized:true})); 
app.use(passport.initialize());
app.use(passport.session());

app.use('/', authRouter);
app.use(verify);
app.use(addTableMess);
app.use('/',managerRouter);
app.use('/', indexRouter);
app.use('/',userRouter);
app.use('/api',apiRouter);
app.use('/tables', tableRouter);
app.use('/product',productRouter);
app.use('/orders',ordersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
