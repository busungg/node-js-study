//로그인을 하지 않았다면 로그인 창이 먼저 뜨고, 로그인한 사용자에게는 도메인 등록화면을 보여줍니다.
//clientSecret을 uuid 모듈을 통해 생성했습니다. uuid는 범용 고유 식별자(universally unique identifier)로 고유한 문자열을 만들고 싶을 때 사용합니다.
//완벽하게 고유하진 않지만 실제 사용 시 중복될 가능성은 거의 없습니다.
//clientSecret에 고유한 문자열을 부여하기 위한 것입니다.

const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { user, domain } = require("../models");

const router = express.Router();

router.get("/", (req, res, next) => {
  const userId = (req.user && req.user.id) || null;

  user
    .findOne({
      where: { id: userId },
      include: { model: domain },
    })
    .then((user) => {
      res.render("login", {
        user,
        loginError: req.flash("loginError"),
        domains: user && user.domains,
      });
    })
    .catch((error) => {
      next(error);
    });
});

router.post("/domain", (req, res, next) => {
  domain
    .create({
      userId: req.user.id,
      host: req.body.host,
      type: req.body.type,
      clientSecret: uuidv4(),
    })
    .then(() => {
      res.redirect("/");
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
