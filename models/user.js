const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  salt: { type: String, required: true },
  dateReg: { type: Date, default: Date.now() },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  avatar: { type: String, default: "defaultavatar.png" },
  member: { type: Boolean, default: false },
  admin: { type: Boolean, default: false },
});

UserSchema.virtual("photoUrl").get(function () {
  return `/images/${this.avatar}`;
});

module.exports = mongoose.model("User", UserSchema);
