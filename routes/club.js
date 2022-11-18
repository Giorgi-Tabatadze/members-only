const express = require("express");
const router = express.Router();

const message_controller = require("../controllers/messageController");
const user_controller = require("../controllers/userController");

//  USER ROUTES
router.get("/", message_controller.message_board_get);
router.get("/sign-up", user_controller.user_signUp_get);
router.post("/sign-up", user_controller.user_signUp_post);
router.get("/login", user_controller.user_login_get);

module.exports = router;
