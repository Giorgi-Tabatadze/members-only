const Message = require("../models/message");
const User = require("../models/user");
const async = require("async");

const { body, validationResult } = require("express-validator");

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
