const mongoose = require("mongoose");

require("dotenv").config();

const conn = process.env.MONGODB_URI;

mongoose.connect(conn, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

// Expose the connection
module.exports = db;
