const passport = require("passport");
const { validPassword } = require("../lib/passportUtils");
const LocalStrategy = require("passport-local").Strategy;
const connection = require("./database");
const User = connection.models.User;

passport.use(
  new LocalStrategy(function (username, password, cb) {
    User.findOne({ username: username }, (err, user) => {
      if (err) {
        cb(err);
      }
      if (!user) {
        return cb(null, false);
      }
      const isValid = validPassword(password, user.hash, user.salt);
      if (isValid) {
        return cb(null, user);
      } else {
        return cb(null, false);
      }
    });
  }),
);
passport.serializeUser(function (user, cb) {
  cb(null, user.id);
});
passport.deserializeUser(function (id, cb) {
  User.findById(id, function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
});
