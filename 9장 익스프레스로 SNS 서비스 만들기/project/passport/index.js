const local = require("./localStrategy");
const kakao = require("./kakaoStrategy");
const { user } = require("../models");

module.exports = (passport) => {
  //req.session 객체에 어떤 데이터를 저장할지 선택
  //done 첫 번째 인자는 에러 발생
  //done 두 번째 인자가 저장 데이터
  //사용자 정보 모두 저장시 용량이 커지므로 id만 저장
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  //매 요청 시 실행됨
  //passport.session() 미들웨어가 이 메서드를 호출함
  //좀 전에 serializeUser에서 세션에 저장했던 아이디(첫번째 매개변수)를 받아 데이터베이스에서 사용자 정보를 조회
  //조회한 정보를 req.user에 저장하므로 req.user를 통해 로그인한 사용자의 정보를 가져옴
  passport.deserializeUser((id, done) => {
    user
      .find({
        where: { id },
      })
      .then((user) => done(null, user))
      .catch((err) => done(err));
  });

  local(passport);
  kakao(passport);
};
