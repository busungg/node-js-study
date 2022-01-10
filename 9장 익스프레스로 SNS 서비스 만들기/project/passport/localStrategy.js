const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const { user } = require("../models");

module.exports = (passport) => {
  passport.use(
    new LocalStrategy(
      //첫 번째 인자는 전략에 관한 설정을 하는 곳입니다.
      //usernameField와 passwordField에는 일치하는 req.body의 속성명을 적어주면 됩니다.
      {
        usernameField: "email",
        passwordField: "password",
      },
      //실제 전략을 수행하는 async 함수 입니다.
      //done은 passport.authenticate의 콜백 함수입니다.
      async (email, password, done) => {
        try {
          const exUser = await user.find({ where: { email } });
          if (exUser) {
            const result = await bcrypt.compare(password, exUser.password);
            if (result) {
              done(null, exUser);
            } else {
              done(null, false, { message: "비밀번호가 일치하지 않습니다." });
            }
          } else {
            done(null, false, { message: "가입되지 않은 회원입니다." });
          }
        } catch (err) {
          console.error(err);
          done(error);
        }
      }
    )
  );
};
