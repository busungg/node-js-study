var express = require("express");
const User = require("../models").User;

var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  User.findAll({ raw: true })
    .then((users) => {
      console.log(users);
      res.render("sequelize", { users });
    })
    .catch((err) => {
      console.error(err);
      next();
    });
});

module.exports = router;
