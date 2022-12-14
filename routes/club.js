const express = require("express");
const router = express.Router();

const message_controller = require("../controllers/messageController");
const user_controller = require("../controllers/userController");
const userUtils = require("../lib/userUtils");

router.use(userUtils.userDataToLocals);

/// Message Routes

router.get("/", message_controller.message_board_get);
router.get("/create-message", message_controller.message_create_get);
router.post("/create-message", message_controller.message_create_post);
router.get("/:id/edit", message_controller.message_edit_get);
router.post("/:id/edit", message_controller.message_edit_post);
router.post("/delete", message_controller.message_remove_post);
router.post("/pin", message_controller.message_pin_post);

//  USER ROUTES

router.get("/sign-up", user_controller.user_signUp_get);
router.post("/sign-up", user_controller.user_signUp_post);
router.get("/login", user_controller.user_login_get);
router.post("/login", user_controller.user_login_post);
router.get("/logout", user_controller.user_logout_get);
router.get("/login-failure", user_controller.user_loginFailure_get);
router.get("/login-success", user_controller.user_loginSuccess_get);
router.get("/become-member", user_controller.user_becomeMember_get);
router.post("/become-member", user_controller.user_becomeMember_post);
router.get("/become-admin", user_controller.user_becomeAdmin_get);
router.post("/become-admin", user_controller.user_becomeAdmin_post);

module.exports = router;
