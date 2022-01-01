var express = require("express");
var Comment = require("../schemas/comment");

var router = express.Router();

/* GET users listing. */
router.get("/:id", function (req, res, next) {
  //게시글 다큐먼트를 조회하는 라우터입니다.
  //find 메서드에 옵션이 추가되어 있습니다.
  //먼저 댓글을 쓴 사용자의 아이디로 댓글을 조회한 뒤 populate 메서드로 관련있는 컬렉션의 다큐먼트를 불러올 수 있습니다.
  //Comment 스키마 commenter 필드의 ref가 User로 되어 있으므로 알아서 users 컬렉션에서 사용자 다큐먼트를 찾아 합칩니다.
  //commenter 필드가 사용자 다큐먼트로 치환됩니다.

  Comment.find({
    commenter: req.params.id,
  })
    .populate("commenter")
    .then((comments) => {
      console.log(comments);
      res.json(comments);
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
});

router.post("/", (req, res, next) => {
  const comment = new Comment({
    commenter: req.body.id,
    comment: req.body.comment,
  });

  comment
    .save()
    .then((result) => {
      //프로미스의 결과로 반환된 result 객체를 populate 메서드로 User 스키마와 합쳤습니다.
      //path 옵션으로 어떤 필드를 합칠지 설정해주면 됩니다.
      return Comment.populate(result, { path: "commenter" });
    })
    .then((result) => {
      console.log(result);
      res.status(201).json(result);
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
});

router.patch("/:id", (req, res, next) => {
  Comment.update(
    {
      _id: req.params.id,
    },
    {
      comment: req.body.comment,
    }
  )
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
});

router.delete("/:id", (req, res, next) => {
  Comment.remove({ _id: req.params.id })
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      next(err);
    });
});

module.exports = router;
