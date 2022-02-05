const SSE = require("sse");

module.exports = (server) => {
  const sse = new SSE(server);
  sse.on("connection", (client) => {
    setInterval(() => {
      client.send(new Date().valueOf().toString());
    }, 1000);
  });
};

/*
SSE 모듈을 불러와 new SSE(익스프레스 서버)로 서버 객체를 생성하면 됩니다.
생성한 객체에 connection 이벤트 리스너를 연결하여 클라이언트와 연결 시 어떤 동작을 할지 정의할 수 있습니다.
매개변수로 client 객체를 쓸 수 있습니다. 라우터에서 SSE를 사용하고 싶다면 app.set 메서드로 client 객체를 등록하고,
req.app.get 메서드로 가져오면 됩니다.
client.send 메서드로 메세지를 보낼 수 있지만 문자열만 보낼 수 있습니다.
 */
