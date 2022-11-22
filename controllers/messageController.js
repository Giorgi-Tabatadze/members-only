const Message = require("../models/message");
const { body, validationResult } = require("express-validator");

exports.message_board_get = function (req, res, next) {
  const dataToGet = !req.isAuthenticated() ? "" : "title body date pinnedDate";
  const populate = !req.isAuthenticated() ? "" : "user";
  Message.find({}, dataToGet)
    .populate(populate, "firstname lastname avatar")
    .exec((err, message_list) => {
      if (err) {
        return next(err);
      }
      res.render("index", { message_list });
    });
};
exports.message_create_get = function (req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect("/club/login");
  } else {
    res.render("message_form");
  }
};
exports.message_create_post = [
  body("title", "Title must be between 1 and 100 characters")
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape(),
  body("body", "Message must be between 1 and 300 characters")
    .trim()
    .isLength({ min: 1, max: 300 })
    .escape(),

  function (req, res, next) {
    if (!req.isAuthenticated()) {
      res.redirect("/club/login");
    } else {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        res.render("message_form", {
          errors: errors.array(),
          title: req.body.title,
          body: req.body.body,
        });
      } else {
        const message = new Message({
          title: req.body.title,
          body: req.body.body,
          user: req.session.passport.user,
        });

        message.save((err) => {
          if (err) {
            return next(err);
          } else res.redirect("/club");
        });
      }
    }
  },
];
exports.message_edit_get = function (req, res, next) {
  res.send("not implemented yet");
};
exports.message_edit_put = function (req, res, next) {
  res.send("not implemented yet");
};
exports.message_remove_delete = function (req, res, next) {
  res.send("not implemented yet");
};
exports.message_pin_put = function (req, res, next) {
  res.send("not implemented yet");
};
