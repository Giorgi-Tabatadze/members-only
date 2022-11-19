const User = require("../models/user");
const passwordUtils = require("../lib/passportUtils");
const passport = require("passport");

exports.userDataToLocals = function (req, res, next) {
  if (req.session?.passport?.user) {
    User.findById(
      req.session.passport.user,
      "username dateReg firstname lastname avatar member admin",
    ).exec((err, user) => {
      if (err) {
        return next(err);
      }
      res.locals.activeUser = user;
      next();
    });
  } else next();
};
