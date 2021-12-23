const http = require("http");
const fs = require("fs");

const users = {};
http
  .createServer((req, res) => {
    if (req.method === "GET") {
      return getMethod(req, res);
    } else if (req.method === "POST") {
      return postMethod(req, res);
    } else if (req.method === "PUT") {
      return putMethod(req, res);
    } else if (req.method === "DELETE") {
      return deleteMethod(req, res);
    }

    res.writeHead(404, "NOT FOUND");
    return res.end("NOT FOUND");
  })
  .listen(8080, () => {
    console.log("8080번 포트에서 서버 대기 중입니다!");
  });

const getMethod = (req, res) => {
  console.log(`${req.url}`);

  if (req.url === "/") {
    return fs.readFile("./restFront.html", (err, data) => {
      if (err) {
        throw err;
      }
      res.end(data);
    });
  } else if (req.url === "/about") {
    return fs.readFile("./about.html", (err, data) => {
      if (err) {
        throw err;
      }
      res.end(data);
    });
  } else if (req.url === "/users") {
    return res.end(JSON.stringify(users));
  }

  //css나 js를 호출할때 사용
  return fs.readFile(`.${req.url}`, (err, data) => {
    if (err) {
      res.writeHead(404, "NOT FOUND");
      return res.end("NOT FOUND");
    }
    return res.end(data);
  });
};

const postMethod = (req, res) => {
  if (req.url === "/users") {
    let body = "";
    req.on("data", (data) => {
      body += data;
    });

    return req.on("end", () => {
      console.log("POST 본문(body):", body);
      const { name } = JSON.parse(body);
      const id = +new Date();
      users[id] = name;
      res.writeHead(200);
      res.end("등록 성공");
    });
  }
};

const putMethod = (req, res) => {
  if (req.url.startsWith("/users/")) {
    const key = req.url.split("/")[2];
    let body = "";
    req.on("data", (data) => {
      body += data;
    });

    return req.on("end", () => {
      console.log("PUT 본문(body):", body);
      users[key] = JSON.parse(body).name;
      return res.end(JSON.stringify(users));
    });
  }
};

const deleteMethod = (req, res) => {
  if (req.url.startsWith("/users/")) {
    const key = req.url.split("/")[2];
    delete users[key];
    return res.end(JSON.stringify(users));
  }
};
