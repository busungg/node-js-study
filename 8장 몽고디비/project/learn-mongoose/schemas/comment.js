const mongoose = require("mongoose");

const { Schema } = mongoose;
const {
  Types: { ObjectId },
} = Schema;
const commentSchema = new Schema({
  commenter: {
    type: ObjectId,
    required: true,
    ref: "User",
  },
  comment: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Comment", commentSchema);

//commenter 속성만 보면 됩니다.
//자료형이 ObjectId입니다.
//옵션으로 ref 속성의 값이 User로 주어져 있습니다.
//commenter 필드에 User 스키마의 사용자 ObjectId가 들어간다는 뜻입니다. 나중에 몽구스가 JOIN과 비슷한 기능을 할 때 사용됩니다.
