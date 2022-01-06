const express = require("express");

const router = express.Router();

router.get("/profile", (req, res) => {
  res.render("profile", {
    title: "내 정보 - Project",
    user: null,
  });
});

router.get("/join", (req, res) => {
  res.render("join", {
    title: "회원가입 - Project",
    user: null,
    joinError: req.flash("joinError"),
  });
});

router.get("/", (req, res, next) => {
  res.render("main", {
    title: "Project",
    twits: [],
    user: null,
    loginError: req.flash("loginError"),
  });
});

module.exports = router;
