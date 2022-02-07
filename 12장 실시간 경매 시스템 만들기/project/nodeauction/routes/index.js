var express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const schedule = require("node-schedule");

const { Good, Auction, User, sequelize } = require("../models");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");

var router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

/* GET home page. */
router.get("/", async function (req, res, next) {
  try {
    const goods = await Good.findAll({ where: { soldId: null } });
    res.render("main", {
      title: "NodeAuction",
      goods,
      loginError: req.flash("loginError"),
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/join", isNotLoggedIn, (req, res) => {
  res.render("join", {
    title: "회원가입 - NodeAuction",
    joinError: req.flash("joinError"),
  });
});

router.get("/good", isLoggedIn, (req, res) => {
  res.render("good", { title: "상품 등록 - NodeAuction" });
});

fs.readdir("uploads", (error) => {
  if (error) {
    console.error("uploads 폴더가 없어 uploads 폴더를 생성합니다.");
    fs.mkdirSync("uploads");
  }
});

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "uploads/");
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(
        null,
        path.basename(file.originalname, ext) + new Date().valueOf() + ext
      );
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  "/good",
  isLoggedIn,
  upload.single("img"),
  async (req, res, next) => {
    try {
      const { name, price } = req.body;
      const good = await Good.create({
        ownerId: req.user.id,
        name,
        img: req.file.filename,
        price,
      });

      const end = new Date();
      end.setDate(end.getDate() + 1); //하루 뒤
      //schedule 객체의 scheduleJob 메서드로 일정을 예약할 수 있습니다.
      //첫 번째 인자로 실행될 시각을 넣고, 두 번째 인자로 해당 시각이 되었을 때 수행할 콜백 함수를 넣습니다.
      schedule.scheduleJob(end, async () => {
        const success = await Auction.findOne({
          where: { goodId: good.id },
          order: [["bid", "DESC"]],
        });

        await Good.update(
          {
            soldId: success.userId,
          },
          {
            where: { id: good.id },
          }
        );

        await User.update(
          {
            //낙찰자의 보유자산을 낙찰 금액만큼 뺍니다.
            //{ 컬럼: sequelize.literal(컬럼 - 숫자)} 가 시퀄라이즈에서 해당 컬럼의 숫자를 줄이는 방법입니다.
            //숫자를 늘리려면 - 대신 +를 하면 됩니다.
            money: sequelize.literal(`money - ${success.bid}`),
          },
          {
            where: { id: success.userId },
          }
        );
      });

      res.redirect("/");
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

router.get("/good/:id", isLoggedIn, async (req, res, next) => {
  try {
    const [good, auction] = await Promise.all([
      Good.findOne({
        where: { id: req.params.id },
        include: {
          model: User,
          as: "owner",
        },
      }),
      Auction.findAll({
        where: { goodId: req.params.id },
        include: { model: User },
        order: [["bid", "ASC"]],
      }),
    ]);
    res.render("auction", {
      title: `${good.name} - NodeAuction`,
      good,
      auction,
      auctionError: req.flash("auctionError"),
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post("/good/:id/bid", isLoggedIn, async (req, res, next) => {
  try {
    const { bid, msg } = req.body;
    const good = await Good.findOne({
      where: { id: req.params.id },
      include: { model: Auction },
      order: [[{ model: Auction }, "bid", "DESC"]],
    });
    if (good.price > bid) {
      // 시작 가격보다 낮게 입찰하면
      return res.status(403).send("시작 가격보다 높게 입찰해야 합니다.");
    }
    // 경매 종료 시간이 지났으면
    if (new Date(good.createdAt).valueOf() + 24 * 60 * 60 * 1000 < new Date()) {
      return res.status(403).send("경매가 이미 종료되었습니다");
    }
    // 직전 입찰가와 현재 입찰가 비교
    if (good.auctions[0] && good.auctions[0].bid >= bid) {
      return res.status(403).send("이전 입찰가보다 높아야 합니다");
    }
    const result = await Auction.create({
      bid,
      msg,
      userId: req.user.id,
      goodId: req.params.id,
    });
    req.app.get("io").to(req.params.id).emit("bid", {
      bid: result.bid,
      msg: result.msg,
      nick: req.user.nick,
    });
    return res.send("ok");
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.get("/list", isLoggedIn, async (req, res, next) => {
  try {
    const goods = await Good.findAll({
      where: { soldId: req.user.id },
      include: { model: Auction },
      order: [[{ model: Auction }, "bid", "DESC"]],
    });
    res.render("list", { title: "낙찰 목록 - NodeAuction", goods });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
