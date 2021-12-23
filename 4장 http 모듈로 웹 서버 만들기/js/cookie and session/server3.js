const { resolveNaptr } = require("dns");
const http = require("http");

const parseCookies = (cookie = "") => {
  return cookie
    .split(";")
    .map((v) => {
      console.log(v.split("="));
      return v.split("=");
    })
    .map(([k, ...vs]) => {
      console.log(k, vs);
      return [k, vs.join("=")];
    })
    .reduce((acc, [k, v]) => {
      console.log(acc, [k, v]);

      acc[k.trim()] = decodeURIComponent(v);
      return acc;
    }, {});
};

http
  .createServer((req, res) => {
    const cookies = parseCookies(req.headers.cookie);

    console.log("본문 쿠키", req.url, cookies);
    res.writeHead(200, { "Set-Cookie": "mycookie=test" });
    res.end("Hello Cookie");
  })
  .listen(8080, () => {
    console.log("8080번 포트에서 서버 대기 중입니다.");
  });
