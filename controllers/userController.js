const User = require("../models/user");
const { body, validationResult } = require("express-validator");
const passwordUtils = require("../lib/passportUtils");
const passport = require("passport");

/// SIGN UP ///

exports.user_signUp_get = function (req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect("/club");
    return;
  }
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
    if (req.isAuthenticated()) {
      res.redirect("/club");
      return;
    }
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("sign_up", {
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        errors: errors.array(),
      });
    }
    User.exists({ username: req.body.username }, function (err, user) {
      if (err) {
        return next(err);
      }
      if (user) {
        res.render("sign_up", {
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          errors: [{ msg: "Username is already in use" }],
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
          res.redirect("/club/login");
        });
      }
    });
  },
];

/// LOGIN /////

exports.user_login_get = function (req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect("/club");
    return;
  }
  res.render("login");
};
exports.user_login_post = [
  body("username", "Username Required").trim().isLength({ min: 1 }).escape(),
  body("password", "Password must be at least 6 characters")
    .trim()
    .isLength({ min: 6 })
    .escape(),

  function (req, res, next) {
    if (req.isAuthenticated()) {
      res.redirect("/club");
      return;
    }
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("login", {
        username: req.body.username,
        errors: errors.array(),
      });
      return;
    }
    next();
  },

  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/club/login-failure",
    successRedirect: "/club/login-success",
  }),
];

exports.user_logout_get = function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/club");
  });
};

exports.user_loginFailure_get = function (req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect("/club");
    return;
  }
  res.render("login", {
    username: req.body.username,
    loginError: req.flash("error"),
  });
};

exports.user_loginSuccess_get = function (req, res, next) {
  res.redirect("/club");
};

exports.user_becomeMember_get = function (req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect("/club/login");
    return;
  } else if (res.locals.activeUser.member) {
    res.redirect("/club");
  } else {
    res.render("become_member");
  }
};

exports.user_becomeMember_post = [
  body("memberQuestion")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Answer is required")
    .escape()
    .custom((value, { req, loc, path }) => {
      if (value === "a" || value === "b" || value === "c" || value === "d") {
        return value;
      } else {
        throw new Error("Answers Should not be modified");
      }
    }),

  function (req, res, next) {
    if (!req.isAuthenticated()) {
      res.redirect("/club/login");
      return;
    } else if (res.locals.activeUser.member) {
      res.redirect("/club");
    } else {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        res.render("become_member", {
          errors: errors.array(),
        });
        return;
      } else {
        const answeredCorrectly = req.body.memberQuestion === "d";
        if (!answeredCorrectly) {
          res.render("become_member", {
            inCorrect: true,
          });
        } else {
          User.findById(req.session.passport.user).exec((err, user) => {
            if (err) {
              return next(err);
            }
            user.member = true;
            user.save((err) => {
              if (err) {
                return next(err);
              }
              res.redirect("/club");
            });
          });
        }
      }
    }
  },
];

exports.user_becomeAdmin_get = function (req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect("/club/login");
    return;
  } else if (!res.locals.activeUser.member) {
    res.redirect("/club/become-member");
  } else if (res.locals.activeUser.admin) {
    res.redirect("/club");
  } else {
    res.render("become_admin");
  }
};

exports.user_becomeAdmin_post = [
  //// VALIDATION
  body("firstAnswer")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Answer is required")
    .escape()
    .custom((value, { req, loc, path }) => {
      if (value === "1" || value === "2" || value === "3" || value === "4") {
        return value;
      } else {
        throw new Error("Answers should be numbers between 1 and 4");
      }
    })
    .custom((value, { req, loc, path }) => {
      if (
        value === req.body.secondAnswer ||
        value === req.body.thirdAnswer ||
        value === req.body.fourthAnswer
      ) {
        throw new Error("Answer order can not contain same numbers");
      } else {
        return value;
      }
    }),
  body("secondAnswer")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Answer is required")
    .escape()
    .custom((value, { req, loc, path }) => {
      if (value === "1" || value === "2" || value === "3" || value === "4") {
        return value;
      } else {
        throw new Error("Answers should be numbers between 1 and 4");
      }
    })
    .custom((value, { req, loc, path }) => {
      if (
        value === req.body.firstAnswer ||
        value === req.body.thirdAnswer ||
        value === req.body.fourthAnswer
      ) {
        throw new Error("Answer order can not contain same numbers");
      } else {
        return value;
      }
    }),
  body("thirdAnswer")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Answer is required")
    .escape()
    .custom((value, { req, loc, path }) => {
      if (value === "1" || value === "2" || value === "3" || value === "4") {
        return value;
      } else {
        throw new Error("Answers should be numbers between 1 and 4");
      }
    })
    .custom((value, { req, loc, path }) => {
      if (
        value === req.body.secondAnswer ||
        value === req.body.firstAnswer ||
        value === req.body.fourthAnswer
      ) {
        throw new Error("Answer order can not contain same numbers");
      } else {
        return value;
      }
    }),
  body("fourthAnswer")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Answer is required")
    .escape()
    .custom((value, { req, loc, path }) => {
      if (value === "1" || value === "2" || value === "3" || value === "4") {
        return value;
      } else {
        throw new Error("Answers should be numbers between 1 and 4");
      }
    })
    .custom((value, { req, loc, path }) => {
      if (
        value === req.body.secondAnswer ||
        value === req.body.firstAnswer ||
        value === req.body.thirdAnswer
      ) {
        throw new Error("Answer order can not contain same numbers");
      } else {
        return value;
      }
    }),

  /// MAIN PROCEDURE
  function (req, res, next) {
    if (!req.isAuthenticated()) {
      res.redirect("/club/login");
      return;
    } else if (!res.locals.activeUser.member) {
      res.redirect("/club/become-member");
    } else if (res.locals.activeUser.admin) {
      res.redirect("/club");
    } else {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        res.render("become_admin", {
          errors: errors.array(),
        });
        return;
      } else {
        const answeredCorrectly =
          req.body.firstAnswer === "1" &&
          req.body.secondAnswer === "4" &&
          req.body.thirdAnswer === "3" &&
          req.body.fourthAnswer === "2";
        if (!answeredCorrectly) {
          res.render("become_admin", {
            inCorrect: true,
          });
        } else {
          User.findById(req.session.passport.user).exec((err, user) => {
            if (err) {
              return next(err);
            }
            user.admin = true;
            user.save((err) => {
              if (err) {
                return next(err);
              }
              res.redirect("/club");
            });
          });
        }
      }
    }
  },
];
