const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  salt: { type: String },
  dateReg: { type: Date, default: date.now() },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  avatar: { type: String, required: true },
  member: { type: Boolean, default: false },
  admin: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", UserSchema);
