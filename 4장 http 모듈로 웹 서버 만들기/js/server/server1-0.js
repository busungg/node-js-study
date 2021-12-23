const http = require("http");

const server = http.createServer((req, res) => {
  res.write("<h1>hello node!</h1>");
  res.end("<p>hello server!</p>");
});

server.listen(8080);
server.on("listening", () => {
  console.log("8080번 포트에서 서버 대기 중입니다!");
});
server.on("error", (error) => {
  console.error(error);
});
