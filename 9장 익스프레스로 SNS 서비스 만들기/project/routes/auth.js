const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const { user } = require("../models");

const router = express.Router();
router.post("/join", isNotLoggedIn, (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    const exUser = await user.find({ where: { email } });
    if (exUser) {
      //기존에 같은 이메일로 가입한 사용자가 있는지 확인합니다.
      req.flash("joinError", "이미 가입된 이메일입니다.");
      return res.redirect("/join");
    }

    //bcrypt 모듈을 사용해서 암호화합니다.
    const hash = await bcrypt.hash(password, 12);
    await user.create({
      email,
      nick,
      password: hash,
    });
    return res.redirect("/");
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

router.post("/login", isNotLoggedIn, (req, res, next) => {
  //passport.authenticate 미들웨어가 local 로그인 전략을 수행합니다.
  //미들웨어인데 라우터 미들웨어 안에 들어있습니다.
  //미들웨어에 사용자 정의 기능을 추가하고 싶을 때 보통 이렇게 하며 내부 미들웨어에 (req, res, next)를 인자로 제공해서 호출하면 됩니다.
  //전략이 성공하거나 실패하면 authenticate 메서드의 콜백함수가 실행됩니다.
  //Passport는 req 객체에 login과 logout 메서드를 추가합니다.
  //req.login은 passport.serializeUser를 호출합니다.
  //req.login에 제공하는 user 객체가 serializeUser로 넘어가게 됩니다.
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      req.flash("loginError", info.message);
      return res.redirect("/");
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect("/");
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
});

//로그아웃 라우터입니다.
//req.logout 메서드는 req.user 객체를 제거하고, req.session.detroy는 req.session 객체의 내용을 제거합니다.
router.get("/logout", isLoggedIn, (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;

//나중에 app.js와 연결할 때 /auth 접두사를 붙일 것이므로 라우터 주소는 각각 /auth/join, /auth/login, /auth/logout이 됩니다.
