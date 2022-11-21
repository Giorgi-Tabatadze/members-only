const Message = require("../models/message");

exports.message_board_get = function (req, res, next) {
  const dataToGet = !req.isAuthenticated() ? "" : "title body date pinnedDate";
  Message.find({}, dataToGet).exec((err, message_list) => {
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
exports.message_create_post = function (req, res, next) {
  res.send("not implemented yet");
};
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
