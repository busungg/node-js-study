const jwt = require("jsonwebtoken");
const RateLimit = require("express-rate-limit");

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send("로그인 필요");
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/");
  }
};

exports.verifyToken = (req, res, next) => {
  try {
    //요청 헤더에 저장된 토큰(req.headers.authorization)을 사용합니다.
    //사용자가 쿠키처럼 헤더에 토큰을 넣어 보낼 것입니다.
    //jwt.verify 메서드로 토큰을 검증할 수 있습니다. 메서드의 첫 번째 인자로는 토큰을, 두 번째 인자로는 토큰의 비밀키를 넣어줍니다.
    //토큰의 비밀키가 일치하지 않는다면 인증을 받을 수 없습니다.
    //인증에 성공한 경우에는 토큰의 내용을 반환합니다. 토큰의 내용은 req.decoded에 대입하여 다음 미들웨어에서 쓸 수 있도록 합니다.
    req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
    console.log(req.headers.authorization);
    console.log(req.decoded);

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      // 유효기간 초과
      return res.status(419).json({
        code: 419,
        message: "토큰이 만료되었습니다.",
      });
    }

    return res.status(401).json({
      code: 401,
      message: "유효하지 않은 토큰입니다.",
    });
  }
};

exports.apiLimiter = RateLimit({
  windowMs: 60 * 1000, //1분
  max: 1,
  delayMs: 0,
  handler(req, res) {
    res.status(this.statusCode).json({
      code: this.statusCode,
      message: "1분에 한 번만 요청할 수 있습니다.",
    });
  },
});

exports.deprecated = (req, res) => {
  res.status(410).json({
    code: 410,
    message: "새로운 버전이 나왔습니다. 새로운 버전을 사용하세요.",
  });
};
