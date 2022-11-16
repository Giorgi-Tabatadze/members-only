var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();

const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");

const MongoStore = require("connect-mongo");

var indexRouter = require("./routes/index");
const clubRouter = require("./routes/club");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//-------------- SESSION SETUP --------------

const sessionStore = new MongoStore({
  mongoUrl: process.env.MONGODB_URI,
});
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 200,
    },
  }),
);

//-------------- PASSPORT SETUP --------------

app.use(passport.initialize());
app.use(passport.session());

// -------------- ROUTES ----------------
app.use("/", indexRouter);
app.use("/club", clubRouter);
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
