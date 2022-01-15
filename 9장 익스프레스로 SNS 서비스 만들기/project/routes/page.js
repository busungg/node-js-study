const express = require("express");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const { post, user } = require("../models");

const router = express.Router();

router.get("/profile", isLoggedIn, (req, res) => {
  res.render("profile", {
    title: "내 정보 - Project",
    user: req.user,
  });
});

router.get("/join", isNotLoggedIn, (req, res) => {
  res.render("join", {
    title: "회원가입 - Project",
    user: req.user,
    joinError: req.flash("joinError"),
  });
});

router.get("/", (req, res, next) => {
  post
    .findAll({
      include: {
        model: user,
        attributes: ["id", "nick"],
      },
      order: [["createdAt", "Desc"]],
    })
    .then((posts) => {
      res.render("main", {
        title: "Project",
        twits: posts,
        user: req.user,
        loginError: req.flash("loginError"),
      });
    })
    .catch((error) => {
      console.error(error);
      next(error);
    });
});

module.exports = router;
