const mongoose = require("mongoose");

module.exports = () => {
  const connect = () => {
    if (process.env.NODE_ENV !== "production") {
      mongoose.set("debug", true);
    }
    mongoose.connect(
      "mongodb://root:1@localhost:27017/admin",
      {
        dbName: "nodejs",
      },
      (error) => {
        if (error) {
          console.log("몽고디비 연결 에러", error);
        } else {
          console.error("몽고디비 연결 성공");
        }
      }
    );
  };

  connect();
  mongoose.connection.on("error", (error) => {
    console.error("몽고디비 연결 에러", error);
  });

  mongoose.connection.on("disconnected", () => {
    console.error("몽고디비 연결이 끊겼습니다. 연결을 재시도합니다.");
    connect();
  });

  //User 스키마와 Comment 스키마를 연결하는 부분입니다.
  require("./user");
  require("./comment");
};
