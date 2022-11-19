exports.message_board_get = function (req, res, next) {
  console.log(res.locals);
  res.render("index", { title: "Welcome page" });
};
exports.message_create_get = function (req, res, next) {
  res.send("not implemented yet");
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
