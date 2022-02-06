var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const checkAuction = require("./checkAuction");
require("dotenv").config();

var indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
var usersRouter = require("./routes/users");
const { sequelize } = require("./models");
const passportConfig = require("./passport");

//checkAuction을 서버에 연결합니다. 서버를 재시작하면 앞으로 서버를 시작할 때마나 낙찰자를 지정하는 작업을 수행합니다.
//checkAuction의 코드는 app.js에 직접 작성해도 되지만 코드가 길어지므로 분리하였습니다.
checkAuction();

var app = express();
sequelize.sync();
passportConfig(passport);

const sessionMiddleware = session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/img", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/auth", authRouter);

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
