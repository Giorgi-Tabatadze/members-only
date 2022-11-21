const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  title: { type: String, required: true, maxLength: 100 },
  body: { type: String, required: true, maxLength: 300 },
  date: { type: Date, default: Date.now() },
  pinnedDate: { type: Date, default: 0 },
  user: { type: Schema.Types.ObjectId, ref: "user", required: true },
});

module.exports = mongoose.model("Mesage", MessageSchema);
