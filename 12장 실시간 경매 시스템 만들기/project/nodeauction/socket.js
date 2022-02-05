const SocketIO = require("socket.io");

module.exports = (server, app) => {
  const io = SocketIO(server, { path: "/socket.io" });

  app.set("io", io);

  io.on("connection", (socket) => {
    const req = socket.request;
    const {
      headers: { referer },
    } = req;
    const roomId = referer.split("/")[referer.split("/").length - 1];
    socket.join(roomId);
    socket.on("disconnect", () => {
      socket.leave(roomId);
    });
  });
};

//클라이언트 연결 시 주소로부터 경매방 아이디를 받아와 socket.join으로 해당 방에 입장합니다.
//연결이 끊겼다면 socket.leave로 해당 방에서 나갑니다.
