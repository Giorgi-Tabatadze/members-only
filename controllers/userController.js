const User = require("../models/user");
const { body, validationResult } = require("express-validator");
const passwordUtils = require("../lib/passportUtils");

exports.user_signUp_get = function (req, res, next) {
  res.render("sign_up");
};
exports.user_signUp_post = [
  body("username", "Username Required").trim().isLength({ min: 1 }).escape(),
  body("firstname", "First name Required").trim().isLength({ min: 1 }).escape(),
  body("lastname", "Last name Required").trim().isLength({ min: 1 }).escape(),
  body("password", "Password must be at least 6 characters")
    .trim()
    .isLength({ min: 6 })
    .escape(),
  body("confirmPassword")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Confirm Password must be at least 6 characters")
    .escape()
    .custom((value, { req, loc, path }) => {
      if (value !== req.body.password) {
        // trow error if passwords do not match
        throw new Error("Passwords don't match");
      } else {
        return value;
      }
    }),
  function (req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("sign_up", {
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        errors: errors.array(),
      });
    } else {
      const saltHash = passwordUtils.genPassword(req.body.password);

      const salt = saltHash.salt;
      const password = saltHash.hash;

      const user = new User({
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: password,
        salt: salt,
      });

      user.save((err) => {
        if (err) {
          return next(err);
        }
        res.redirect("/login");
      });
    }
  },
];
exports.user_login_get = function (req, res, next) {
  res.send("not implemented yet");
};
exports.user_login_post = function (req, res, next) {
  res.send("not implemented yet");
};
exports.user_becomeMember_get = function (req, res, next) {
  res.send("not implemented yet");
};
exports.user_becomeMember_post = function (req, res, next) {
  res.send("not implemented yet");
};
exports.user_becomeAdmin_get = function (req, res, next) {
  res.send("not implemented yet");
};
exports.user_becomeAdmin_post = function (req, res, next) {
  res.send("not implemented yet");
};
