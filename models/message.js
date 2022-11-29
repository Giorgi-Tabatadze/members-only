const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  title: { type: String, required: true, maxLength: 100 },
  body: { type: String, required: true, maxLength: 300 },
  date: { type: Date, default: Date.now() },
  pinnedDate: { type: Date, default: 0 },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  userAuthorCompare: { type: Number },
});

MessageSchema.virtual("dateFormatted").get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATETIME_MED);
});

module.exports = mongoose.model("Message", MessageSchema);
