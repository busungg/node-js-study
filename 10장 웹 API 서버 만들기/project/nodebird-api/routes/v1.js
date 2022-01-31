const express = require("express");
const jwt = require("jsonwebtoken");

const { verifyToken } = require("./middlewares");
const { domain, user, post, hashtag } = require("../models");

const router = express.Router();

router.post("/token", async (req, res) => {
  const { clientSecret } = req.body;
  console.log(clientSecret);

  try {
    const domainInfo = await domain.findOne({
      where: { clientSecret },
      include: {
        model: user,
        attribute: ["nick", "id"],
      },
    });

    if (!domainInfo) {
      return res.status(401).json({
        code: 401,
        message: "등록되지 않은 도메인입니다. 먼저 도메인을 등록하세요",
      });
    }

    const token = jwt.sign(
      {
        id: domainInfo.user.id,
        nick: domainInfo.user.nick,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1m",
        issuer: "nodebird",
      }
    );

    return res.json({
      code: 200,
      message: "토큰이 발급되었습니다.",
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "서버 에러",
    });
  }
});

router.get("/test", verifyToken, (req, res) => {
  res.json(req.decoded);
});

module.exports = router;
