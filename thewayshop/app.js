const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const { engine } = require("express-handlebars");
const dotenv = require("dotenv");
dotenv.config();
const session = require("express-session");
const passport = require("./config/passport");
const fs = require('fs');
//route
const homeRouter = require("./component/home/route");
const myaccountRouter = require("./component/account/route");
const authRouter = require("./component/auth/route");
const productRouter = require("./component/product/route");
const shopRouter = require("./component/shop/route");
const apiRouter = require("./api/route");

//middleware
const layout = require("./middleware/layout");
const verify = require("./middleware/verifyUser");
const visit = require("./middleware/increaseVisit");
const app = express();
const app2 = express();
// view engine setup
app.engine(
  "hbs",
  engine({
    defaultLayout: "layout",
    extname: ".hbs",
    layoutsDir: path.join(__dirname, "views/layout"),
    partialsDir: path.join(__dirname, "views/partials"),
    helpers: require("./helper/hbsHelper"),
  })
);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(visit);
app.use(layout);
app.use(verify);
app.use("/", homeRouter);
app.use("/", authRouter);
app.use("/api", apiRouter);
app.use("/shop", shopRouter);
app.use("/myaccount", myaccountRouter);
app.use("/product", productRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});



// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
