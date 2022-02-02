const SocketIO = require("socket.io");
const axios = require("axios");

const sharedsession = require("express-socket.io-session");

module.exports = (server, app, sessionMiddleware) => {
  console.log("==================================================");
  console.log("sessionMiddleware");
  console.log(sessionMiddleware);
  console.log("==================================================");

  const io = SocketIO(server, { path: "/socket.io" });

  //라우터에서 io 객체를 쓸 수 있게 저장해둡니다.
  //req.app.get('io')로 접근 가능합니다.
  app.set("io", io);

  //of 메서드는 Socket.IO에 네임스페이스를 부여하는 메서드입니다.
  //Socket.IO는 기본적으로 / 네임스페이스에 접속하지만, of 메서드를 사용하면 다른 네임스페이스를 만들어 접속 할 수 있습니다.
  //같은 네임스페이스끼리만 데이터를 전달합니다.
  const room = io.of("/room");
  const chat = io.of("/chat");

  //io.use 메서드에 미들웨어를 장착할 수 있습니다.
  //이 부분은 모든 웹 소켓 연결 시마다 실행됩니다. 세션 미들웨어에 요청 객체, 응답 객체, next 함수를 인자로 넣어주면 됩니다.
  io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res, next);
  });
  //io.use(sharedsession(sessionMiddleware));

  //https://www.inflearn.com/questions/89800

  room.on("connection", (socket) => {
    console.log("room 네임스페이스에 접속");

    console.log("session socket 존재", socket.request);

    socket.on("disconnect", () => {
      console.log("room 네임스페이스 접속 해제");
    });
  });

  chat.on("connection", (socket) => {
    console.log("chat 네임스페이스에 접속");
    const req = socket.request;
    const {
      headers: { referer },
    } = req;
    const roomId = referer
      .split("/")
      [referer.split("/").length - 1].replace(/\?.+/, "");

    // /room과 비슷하지만 네임스페이스 접속 시 socket.join 메서드가 있고, 접속 해제 시 socket.leave 메서드가 있습니다.
    // 각각 방에 들어가고 나가는 메서드입니다. 연결이 끊기면 자동으로 방에서 나가지만, 확실히 나가기 위해 추가했습니다.
    socket.join(roomId);

    //socket.to(방 아이디) 메서드로 특정 방에 데이터를 보낼 수 있습니다.
    //세션 미들웨어와 Socket.IO를 연결했으므로 웹 소켓에서 세션을 사용할 수 있습니다.
    socket.to(roomId).emit("join", {
      user: "system",
      chat: `${req.session.color}님이 입장하셨습니다.`,
    });

    socket.on("disconnect", () => {
      console.log("chat 네임스페이스 접속 해제");
      socket.leave(roomId);
      //socket.adapter.rooms[방 아이디]에 참여 중인 소켓 정보가 들어 있습니다.
      const currentRoom = socket.adapter.rooms[roomId];
      const userCount = currentRoom ? currentRoom.length : 0;
      console.log(userCount);
      if (userCount === 0) {
        axios
          .delete(`http://localhost:8005/room/${roomId}`)
          .then(() => {
            console.log("방 제거 요청 성공");
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        socket.to(roomId).emit("exit", {
          user: "system",
          chat: `${req.session.color}님이 퇴장하셨습니다.`,
        });
      }
    });
  });
};

/*
module.exports = (server) => {
  const io = SocketIO(server, { path: "/socket.io" });

  io.on("connection", (socket) => {
    const req = socket.request;
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("새로운 클라이언트 접속!", ip, socket.id, req.ip);
    socket.on("disconnect", () => {
      console.log("클라이언트 접속 해제", ip, socket.id);
      clearInterval(socket.interval);
    });

    socket.on("error", (error) => {
      console.error(error);
    });

    socket.on("reply", (data) => {
      console.log(data);
    });

    socket.interval = setInterval(() => {
      //이벤트이름, 데이터
      socket.emit("news", "Hello Socket.IO");
    }, 3000);
  });
};
*/

/*
const WebSocket = require("ws");

module.exports = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, req) => {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("새로운 클라이언트 접속", ip);

    ws.on("message", (message) => {
      console.log(message);
    });

    ws.on("error", (error) => {
      console.error(error);
    });

    ws.on("close", () => {
      console.log("클라이언트 접속 해제", ip);
      clearInterval(ws.interval);
    });

    const interval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        //연결된 모든 클라이언트에게 메시지를 보내는 부분
        ws.send("서버에서 클라이언트로 메시지를 보냅니다.");
      }
    }, 3000);
    ws.interval;
  });
};
*/
