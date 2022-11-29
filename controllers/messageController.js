const Message = require("../models/message");
const User = require("../models/user");
const async = require("async");

const { body, param, validationResult } = require("express-validator");
const message = require("../models/message");

exports.message_board_get = function (req, res, next) {
  const loggedUserId = req.isAuthenticated() ? req.session.passport.user : "";
  const aggregationPipeline = res.locals?.activeUser?.member
    ? [
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
            pipeline: [{ $unset: ["password", "salt"] }],
          },
        },
        {
          $sort: {
            pinnedDate: -1,
            date: -1,
          },
        },
        { $unwind: "$user" },
        {
          $addFields: {
            userAuthorCompare: {
              $strcasecmp: [
                {
                  $toString: "$user._id",
                },
                loggedUserId,
              ],
            },
          },
        },
      ]
    : [
        {
          $sort: {
            date: -1,
          },
        },
        {
          $addFields: {
            userAuthorCompare: {
              $strcasecmp: [
                {
                  $toString: "$user",
                },
                loggedUserId,
              ],
            },
          },
        },
      ];
  Message.aggregate(aggregationPipeline).exec((err, message_list) => {
    if (err) {
      return next(err);
    }
    const hydrated = message_list.map((message) => {
      message.user = User.hydrate(message.user);
      message = Message.hydrate(message);
      return message;
    });
    res.render("index", { message_list: hydrated });
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
exports.message_edit_get = [
  param("id").escape(),

  function (req, res, next) {
    if (!req.isAuthenticated()) {
      res.redirect("/club/login");
    }
    if (!res.locals.activeUser.member) {
      res.redirect("/club/become-member");
    }
    Message.findById(req.params.id).exec((err, messageToEdit) => {
      if (err) {
        return next(err);
      }
      if (messageToEdit == undefined) {
        const messageNotFound = new Error(
          "Message with provided id doesnt exist",
        );
        return next(messageNotFound);
      }
      if (messageToEdit.user.toString() !== req.session.passport.user) {
        const perimissionError = new Error(
          "You are not allowed to modify this message",
        );
        return next(perimissionError);
      } else {
        res.render("message_form", {
          title: messageToEdit.title,
          body: messageToEdit.body,
          messageId: messageToEdit._id,
        });
      }
    });
  },
];
exports.message_edit_post = [
  body("title", "Title must be between 1 and 100 characters")
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape(),
  body("body", "Message must be between 1 and 300 characters")
    .trim()
    .isLength({ min: 1, max: 300 })
    .escape(),
  body("messageId").trim().escape(),

  function (req, res, next) {
    if (!req.isAuthenticated()) {
      res.redirect("/club/login");
    }
    if (!res.locals.activeUser.member) {
      res.redirect("/club/become-member");
    }
    Message.findById(req.body.messageId).exec((err, messageToEdit) => {
      if (err) {
        return next(err);
      }
      if (messageToEdit == undefined) {
        const messageNotFound = new Error(
          "Message with provided id doesnt exist",
        );
        return next(messageNotFound);
      }
      if (messageToEdit.user.toString() !== req.session.passport.user) {
        const perimissionError = new Error(
          "You are not allowed to modify this message",
        );
        return next(perimissionError);
      } else {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          res.render("message_form", {
            errors: errors.array(),
            title: req.body.title,
            body: req.body.body,
            messageId: req.body.messageId,
          });
        } else {
          const updatedMessage = new Message({
            title: req.body.title,
            body: req.body.body,
            date: messageToEdit.date,
            user: messageToEdit.user,
            pinnedDate: messageToEdit.pinnedDate,
            _id: messageToEdit._id,
          });
          Message.findByIdAndUpdate(
            req.body.messageId,
            updatedMessage,
            (err) => {
              if (err) {
                return next(err);
              } else {
                res.redirect("/club");
              }
            },
          );
        }
      }
    });
  },
];
exports.message_remove_post = [
  body("messageId").trim().escape(),

  function (req, res, next) {
    if (!req.isAuthenticated()) {
      res.redirect("/club/login");
    }
    if (!res.locals.activeUser.admin) {
      res.redirect("/club/become-member");
    } else {
      Message.findByIdAndRemove(req.body.messageId, (err, messageToDelete) => {
        if (err) {
          return next(err);
        }
        if (messageToDelete == undefined) {
          const messageNotFound = new Error(
            "Message with provided id doesnt exist",
          );
          return next(messageNotFound);
        } else {
          res.redirect("/club");
        }
      });
    }
  },
];
exports.message_pin_post = [
  body("messageId").trim().escape(),

  function (req, res, next) {
    if (!req.isAuthenticated()) {
      res.redirect("/club/login");
    }
    if (!res.locals.activeUser.admin) {
      res.redirect("/club/become-member");
    } else {
      Message.findById(req.body.messageId).exec((err, messageToPin) => {
        if (err) {
          return next(err);
        }
        console.log(messageToPin);
        if (messageToPin == undefined) {
          const messageNotFound = new Error(
            "Message with provided id doesnt exist",
          );
          return next(messageNotFound);
        } else {
          console.log(messageToPin.pinnedDate.getDate());
          if (messageToPin.pinnedDate.getTime() != 0) {
            messageToPin.pinnedDate = 0;
          } else {
            messageToPin.pinnedDate = Date.now();
          }
          messageToPin.save((err) => {
            if (err) {
              return next(err);
            } else {
              res.redirect("/club");
            }
          });
        }
      });
    }
  },
];
