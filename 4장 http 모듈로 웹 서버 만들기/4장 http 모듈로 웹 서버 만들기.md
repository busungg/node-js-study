# 요청과 응답 이해하기

서버는 클라이언트가 있기에 동작합니다. 클라이언트에서 서버로 요청(request)을 보내고, 서버에서는 요청의 내용을 읽고 처리한 뒤 클라이언트에게 응답(response)을 보냅니다.  
따라서 서버에는 요청을 받는 부분과 응답을 보내는 부분이 있어야 합니다. 요청과 응답은 **_이벤트 방식이라고_** 생각하면 됩니다. 클라이언트로부터 요청이 왔을 때 어떤 작업을 수행할지 이벤트 리스너를 미리 등록해두어야 합니다.

```
const http = require("http");

http.createServer((req, res) => {
  //여기에 어떻게 응답할지 적어줍니다.
});
```

http 서버가 있어야 웹 브라우저의 요청을 처리할 수 있으므로 **_http 모듈_** 을 사용했습니다.  
http 모듈에는 createServer 메서드가 있습니다. 인자로 요청에 대한 콜백 함수를 넣을 수 있습니다. 요청이 들어올 때마다 매번 콜백 함수가 실행됩니다. 따라서 이 콜백 함수에 응답을 적어주면 됩니다.

1. createServer 콜백
   - req
     - request의 줄임말입니다.(보통 사용합니다.)
     - req 객체는 요청에 관한 정보를 제공합니다.
   - res
     - resonse의 줄임말입니다.(보통 사용합니다.)
     - res 객체는 응답에 관한 정보를 제공합니다.

응답을 보내는 부분과 서버 연결 부분을 추가해보겠습니다.

```
const http = require("http");

http
  .createServer((req, res) => {
    res.write("<h1>hello node!</h1>");
    res.end("<p>hello server!</p>");
  })
  .listen(8080, () => {
    console.log("8080번 포트에서 서버 대기 중입니다!");
  });
```

createServer 메서드 뒤에 listen 메서드를 붙이고 클라이언트에게 공개할 포트 번호와 포트 연결 완료 후 실행될 콜백 함수를 넣어줍니다. 이제 이 파일을 실행하면 서버는 8080 포트에서 요청이 오기를 대기합니다.  
listen 메서드에 콜백 함수를 넣는 대신, 다음과 같이 서버에 listening 이벤트 리스너를 붙어도 됩니다. 추가로 error 이벤트 리스너도 붙여 보았습니다.

```
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

```

res 객체에는 res.write와 res.end 메서드가 있습니다. **_우선 res.write의 첫 번째 인자는 클라이언트로 보낼 데이터입니다. 지금은 HTML 모양의 문자열을 보냈지만 버퍼를 보낼 수도 있습니다. 또한, 여러 번 호출해서 데이터를 여러 개 보내도 됩니다._**  
**_res.end는 응답을 종료하는 메서드입니다. 만약 인자가 있다면 그 데이터도 클라이언트로 보내고 응답을 종료합니다._**  
따라서 위의 예제는 res.write에서 HTML 문자열 한 번, res.end에서 HTML 문자열을 한 번 클라이언트로 보낸 후 응답이 종료된 것입니다. 브라우저는 응답 내용을 받아서 렌더링합니다.

**_HTML 파일을 읽어서 전송하는 방법을 배워보겠습니다._**

```
const http = require("http");
const fs = require("fs");

http
  .createServer((req, res) => {
    fs.readFile("./server2.html", (err, data) => {
      if (err) {
        throw err;
      }

      res.end(data);
    });
  })
  .listen(8080, () => {
    console.log("8080번 포트에서 서버 대기 중입니다.");
  });

```

요청이 들어오면 먼저 fs 모듈로 HTML 파일을 읽습니다. data 변수에 저장된 버퍼를 그대로 클라이언트에 보내주면 됩니다. 이전 예제에서는 문자열을 보냈지만, 저렇게 버퍼를 보낼 수도 있습니다.

# 쿠키와 세션 이해하기

클라이언트에서 보내는 요청에는 한 가지 큰 단점이 있습니다. 바로 누가 요청을 보내는지 모른다는 것입니다. 물론 요청을 보내느 IP 주소나 브라우저의 정보를 받아올 수는 있습니다. 하지만 여러 컴퓨터가 공통으로 IP 주소를 가지거나, 한 컴퓨터를 여러 사람이 사용할 수도 있습니다.  
그래서 로그인을 구현해야 하는데 로그인 기능은 **_내부적으로 쿠키와 세션을 사용_**하고 있습니다.  
클라이언트 사용자가 누구인지 기억하기 위해서, **_서버는 요청에 대한 응답을 할 때 쿠키라는 것을 같이 보내줍니다. 쿠키는 name=1 와 같이 간단한 '키-값'의 쌍입니다. 서버로부터 쿠키가 오면 웹 브라우저는 쿠키를 저장해두었다가 요청할 때마다 쿠키를 동봉해서 보내줍니다. 서버는 요청에 들어 있는 쿠키를 읽어서 사용자가 누구인지 파악합니다._**  
브라우저는 쿠키가 있다면 자동으로 동봉해서 보내주므로 따로 처리할 필요가 없습니다. 서버에서 브라우저로 쿠키를 보낼때만 코드를 작성하여 처리하면 됩니다.  
**_즉, 서버는 미리 클라이언트에 요청자를 추정할 만한 정보를 쿠키로 만들어 보내고, 그 다음부터는 클라이언트로부터 쿠키를 받아 요청자를 파악합니다. 쿠키가 여러분이 누구인지 추적하고 있는 젓입니다. 쿠키는 요청과 응답은 헤더(header)에 저장됩니다. 요청과 응답은 각각 헤더와 본문(body)을 가집니다._**

```
const { resolveNaptr } = require("dns");
const http = require("http");

const parseCookies = (cookie = "") => {
  return cookie
    .split(";")
    .map((v) => {
      return v.split("=");
    })
    .map(([k, ...vs]) => {
      return [k, vs.join("=")];
    })
    .reduce((acc, [k, v]) => {
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
```

parseCookies라는 함수를 직접 만들어보았는데 해당 함수는 쿠키 문자열을 객체로 바꾸는 함수입니다.  
**_createServer 메서드의 콜백에서는 제일 먼저 req 객체에 담겨 있는 쿠키를 분석 합니다. 쿠키는 req.headers.cookie에 들어 있습니다. req.headers는 요청의 헤더를 의미합니다._**  
또한 응답의 헤더의 쿠키를 기록해야 하므로 **_res.writeHead 메서드를 사용하였습니다. 첫 번째 인자로 200이라는 상태 코드를 넣어두었습니다. 200은 성공이라는 의미입니다. 두 번째 인자로는 헤더의 내용을 입력합니다. Set-Cookie는 브라우저한테 다음과 같은 값의 쿠키를 저장하라는 의미입니다. 실제로 응답을 받은 브라우저는 mycookie=tset라는 쿠키를 저장합니다._**  
req.url은 주소의 path와 search 부분을 알려줍니다.
**_ 로그를 보면 요청은 분명 한 번만 보냈는데 두 개가 기록되어 있습니다. /favicon.ico는 요청한 적이 없는데 말이죠, 첫 번째 요청('/')에서는 쿠키에 대한 정보가 없다고 나오고, 두 번째 요청('/favicon.ico')에서는 쿠키가 기록되어 있습니다._**
파피콘이란 웹 사이트 탭에 보이는 이미지를 뜻합니다. 브라우저는 파비콘이 뭔지 HTML에서 유추할 수 없으면 서버에 파비콘 정보에 대한 요청을 보냅니다.

### 1. 쿠키로 식별해보기

아직까지는 단순한 쿠키만 심었을 뿐, 그 쿠키가 나인지를 식별해주지 못하고 있습니다.
다음 예제에서 식별하는 방법에 대해 알아봅시다.

```
const http = require("http");
const fs = require("fs");
const url = require("url");
const qs = require("querystring");

const parseCookies = (cookie = "") => {
  return cookie
    .split(";")
    .map((v) => {
      return v.split("=");
    })
    .map(([k, ...vs]) => {
      return [k, vs.join("=")];
    })
    .reduce((acc, [k, v]) => {
      acc[k.trim()] = decodeURIComponent(v);
      return acc;
    }, {});
};

http
  .createServer((req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    if (req.url.startsWith("/login")) {
      const { query } = url.parse(req.url);
      const { name } = qs.parse(query);
      const expires = new Date();
      expires.setMinutes(expires.getMinutes() + 5);

      res.writeHead(302, {
        Location: "/",
        "Set-Cookie": `name=${encodeURIComponent(
          name
        )};Expires=${expires.toUTCString()};HttpOnly;Path=/`,
      });
      res.end();
    } else if (cookies.name) {
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
      });
      res.end(`${cookies.name}님 안녕하세요`);
    } else {
      fs.readFile("./server4.html", (err, data) => {
        if (err) {
          throw err;
        }

        res.end(data);
      });
    }
  })
  .listen(8080, () => {
    console.log("8080번 포트에서 서버 대기 중입니다.");
  });
```

1. 주소가 /login으로 시작할 경우에는 url과 querystring 모듈로 각각 주소와 주소에 딸려오는 query를 분석합니다. 그리고 쿠키의 만료 시간도 지금으로부터 5분 뒤로 설정하였습니다. 이제 302 응답 코드, 리다이렉트 주소와 함께 쿠키를 헤더에 넣습니다. 브라우저는 이 응답 코드를 보고 페이지를 해당 주소로 리다이렉트 합니다. 헤더에는 한글을 설정할 수 없으므로 name 변수를 encodeURIComponent 메서드를 인코딩했습니다.
2. 그 외의 경로(/로 접속했을 때 등), 먼저 쿠키가 있는지 없는지를 확인합니다. 쿠키가 없다면 로그인할 수 있는 페이지를 보냅니다. 처음 방문한 경우엔 쿠키가 없으므로 server4.html이 전송됩니다. 쿠키가 있으면 로그인한 상태로 간주하여 인사말을 보냅니다. res.end 메서드에 한글이 들어가면 인코딩 문제가 발생하므로 res.writeHead에 Content-Type을 text/html; charset=utf-8로 설정해 인코딩을 명시하였습니다.

3. 쿠키 설정 시 각종 옵션
   - 쿠키명=쿠키값
     - 기본적인 쿠키의 값입니다. mycookie=test 또는 name=123 같이 설정합니다.
   - Expires=날짜
     - 만료 기한입니다. 이 기한이 지나면 쿠키가 제거됩니다. 기본값은 클라이언트가 종료될 때까지입니다.
   - Max-age=초
     - Expires와 비슷하지만 날짜 대신 초를 입력할 수 있습니다. 해당 초가 지나면 쿠키가 제거됩니다. Expires보다 우선합니다.
   - Domain=도메인명
     - 쿠키가 전송될 도메인을 특정할 수 있습니다. 기본값은 현재 도메인입니다.
   - Path=URL
     - 쿠키가 전송될 URL을 특정할 수 있습니다. 기본값은 '/'이고 이 경우 모든 URL에서 쿠키를 전송할 수 있습니다.
   - Secure
     - HTTPS일 경우에만 쿠키가 전송됩니다.
   - HttpOnly
     - 설정 시 자바스크립트에서 쿠키에 접근할 수 없습니다. 쿠키 조작을 방지하기 위해 설정하는 것이 좋습니다.

원하는 대로 동작하기는 하지만 이 방식은 상당히 위험합니다. 현재 Application 탭에서 보이는 것처럼 쿠키가 노출되어 있습니다. 또한, 쿠키가 조작될 위험도 있습니다. 따라서 이름 같은 민감한 개인정보를 쿠키에 넣어두는 것은 적절하지 못합니다.  
다음과 같이 코드를 변경하여 서버가 사용자 정보를 관리하도록 만듭시다.

```
const http = require("http");
const fs = require("fs");
const url = require("url");
const qs = require("querystring");

const parseCookies = (cookie = "") => {
  return cookie
    .split(";")
    .map((v) => {
      return v.split("=");
    })
    .map(([k, ...vs]) => {
      return [k, vs.join("=")];
    })
    .reduce((acc, [k, v]) => {
      acc[k.trim()] = decodeURIComponent(v);
      return acc;
    }, {});
};

const session = {};

const server = http
  .createServer((req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    if (req.url.startsWith("/login")) {
      const { query } = url.parse(req.url);
      const { name } = qs.parse(query);
      const expires = new Date();
      expires.setMinutes(expires.getMinutes() + 5);

      /**중요 */
      const randomInt = +new Date();
      session[randomInt] = {
        name,
        expires,
      };
      res.writeHead(302, {
        Location: "/",
        "Set-Cookie": `session=${randomInt};Expires=${expires.toUTCString()};HttpOnly;Path=/`,
      });
      res.end();
    } else if (
      cookies.session &&
      session[cookies.session].expires > new Date()
    ) {
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
      });
      res.end(`${session[cookies.session].name}님 안녕하세요`);
    } else {
      fs.readFile("./server4.html", (err, data) => {
        if (err) {
          throw err;
        }

        res.end(data);
      });
    }
  })
  .listen(8080, () => {
    console.log("8080번 포트에서 서버 대기 중입니다.");
  });

```

server4.js와는 다르게 쿠키에 이름을 담아서 보내는 대신, randomInt라는 임의의 숫자를 보냈습니다. 사용자의 이름과 만료 시간은 session이라는 객체에 대신 저장합니다.  
이제 cookie.session이 있고 만료 기한을 넘기지 않았다면 session 변수에서 사용자 정보를 가져와서 사용합니다.  
**_이 방식이 세션입니다._** 서버에 사용자 정보를 저장하고 클라이언트와는 **_세션 아이디_**로만 소통합니다. 세션 아이디는 꼭 쿠키를 사용해서 주고 받지 않아도 됩니다. 하지만 많은 웹 사이트가 쿠키를 사용합니다. 쿠키를 사용하는 방법이 제일 간단하기 때문입니다.  
**_물론 실제 배포용 서버에서는 세션을 위와 같이 변수에 저장하지 않습니다. 서버가 멈추거나 재시작되면 메모리에 저장된 변수가 초기화되기 때문입니다. 또한, 서버의 메모리가 부족하면 세션을 저장하지 못하는 문제도 생깁니다. 그래서 보통은 데이터베이스에 넣어둡니다._**  
**_서비스를 새로 만들 때마다 쿠키와 세션을 직접 구현할 수는 없습니다. 게다가 지금 코드로는 쿠키를 악용한 여러 가지 위협을 방어하지도 못합니다. 위의 방식 역시 세션 아이디 값이 공개되어 있어 누출되면 다른 사람이 사용할 수 있습니다. 따라서 다른 사람들이 만든 검증된 코드를 사용할 것입니다._**

# REST API와 라우팅

서버에 요청을 보낼 때는 주소를 통해 요청의 내용을 표현합니다. 주소가 /index.html이면 서버의 index.html을 보내달라는 뜻이고, /about.html이면 about.html을 보내달라는 뜻입니다.  
요청이 항상 html을 요구할 필요는 없습니다. 이전 절의 server5.js에서도 /login이라는 주소를 통해서 html을 요청하는 대신 세션 저장이라는 동작을 취하길 요청했습니다.  
이렇게 요청이 주소를 통해 들어오므로 서버가 이해하기 쉬운 주소를 사용하는 것이 좋습니다. 여기서 REST API가 등장합니다.

### 1. REST API란?

1. REST API는 REpresentational State Transfer의 약어이며 네트워크 구조의 한 형식입니다.
2. 서버의 자원을 정의하고, 자원에 대한 주소를 지정하는 방법을 가리킵니다.
3. 주소는 의미를 명확히 전달하기 위해 명사로 구성됩니다. /user이면 사용자 정보에 관련된 자원을 요청하는 것이고, /post라면 게시글에 관련된 자원을 요청하는 것이라고 추측할 수 있습니다.
4. REST API는 주소 외에도 **_HTTP 요청 메서드_** 라는 것을 사용합니다. 폼 데이터를 전송할 때 GET 또는 POST 메서드를 지정해보았나요? 여기서 GET과 POST가 바로 요청 메서드이며 PUT, PATCH, DELETE까지 총 다섯 개가 메서드로 많이 사용됩니다.

### 2. HTTP 요청 메서드

1. GET
   - 서버의 자원을 가져오고자 할 때 사용합니다. 요청의 본문(body)에 데이터를 넣지 않습니다. 데이터를 서버로 보내야 한다면 쿼리스트링을 사용합니다.
2. POST
   - 서버에 자원을 새로 등록하고자 할 때 사용합니다. 요청의 본문에 새로 등록할 데이터를 넣어 보냅니다.
3. PUT
   - 서버의 자원을 요청에 들어 있는 자원으로 치환하고자 할 때 사용합니다. 요청의 본문에 치환할 데이터를 넣어 보냅니다.
4. PATCH
   - 서버 자원의 일부만 수정하고자 할 때 사용합니다. 요청의 본문에 일부 수정할 데이터를 넣어 보냅니다.
5. DELETE
   - 서버의 자원을 삭제하고자 할 때 사용합니다.

주소 하나가 요청 메서드를 여러 개 가질 수 있습니다. GET 메서드의 /user 주소로 요청을 보내면 사용자 정보를 가져오는 요청이라는 것을 알 수 있고, POST 메서드의 /user 주소로 요청을 보내면 새로운 사용자를 등록하려 한다는 것을 알 수 있습니다.  
**_이렇게 주소와 메서드만 보고 요청의 내용을 명확하게 알아볼 수 있다는 것이 장점입니다. 또한, GET 메서드와 같은 경우에는 브라우저에서 캐싱할 수도 있어서 같은 주소의 GET 요청을 할 때 서버에서 가져오는 것이 아니라 캐시에서 가져올 수도 있습니다._**

이제 REST API를 사용한 주소 체계로 RESTful한 웹 서버를 만들어보겠습니다. REST API를 따르는 서버를 RESTful하다고 표현합니다. 코드를 작성하기 전에 대략적인 주소를 먼저 설계하는 것이 좋습니다.

1. 요청이 어떤 메서드를 사용했는지 req.method로 알 수 있습니다. 따라서 req.method를 기준으로 if문을 분기 처리하였습니다.
2. POST와 PUT 메서드는 클라이언트로부터 데이터를 받으므로 특별한 처리가 필요합니다. **_req.on('data', 콜백)과 req.on('end', 콜백) 부분인데요 버퍼와 스트림에서 배웠던 readStream 입니다. readStream으로 요청과 같이 들어오는 요청 본문을 받을 수 있습니다. 단 문자열이므로 JSON으로 만드는 JSON.parse 과정이 한 번 필요합니다._**

# cluster

cluster 모듈은 싱글 스레드인 노드가 CPU 코어를 모두 사용할 수 있게 해주는 모듈입니다. 포트를 공유하는 노드 프로세스를 여러 개 둘 수도 있어 요청이 많이 들어왔을 때 병렬로 실행된 서버의 개수만큼 요청이 분산되게 할 수 있습니다.  
예를 들어 코어가 8개인 서버가 있을 때, 노드는 보통 코어를 하나만 활용합니다. 하지만 cluster 모듈을 설정하여 코어 하나당 노드 프로세스 하나가 돌아가게 할 수 있습니다. 성능이 꼭 8배가 되는 것은 아니지만 코어를 하나만 사용할 때에 비해 성능이 개선됩니다. 하지만 장점만 있는 것은 아니며, 세션을 공유하지 못하는 등의 단점도 있습니다. 이는 Redis등의 서버를 도입하여 해결할 수 있습니다.

```
const cluster = require("cluster");
const http = require("http");
const numCPUs = require("os").cpus().length;

if (cluster.isMaster) {
  console.log(`마스터 프로세스 아이디 ${process.pid}`);

  //CPU 개수만큼 워커를 생산
  for (let i = 0; i < numCPUs; i += 1) {
    cluster.fork();
  }

  //워커가 종료되었을 때
  cluster.on("exit", (worker, code, signal) => {
    console.log(`${worker.process.pid}번 워커가 종료되었습니다.`);
  });
} else {
  //워커들이 포트에서 대기
  http
    .createServer((req, res) => {
      res.write("<h1>hello node</h1>");
      res.end("<p>hello cluster</p>");
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    })
    .listen(8080);

  console.log(`${process.pid}번 워커 실행`);
}

```

**_클러스터에는 마스터 프로세스와 워커 프로세스가 있습니다. 마스터 프로세스는 CPU 개수만큼 워커 프로세스를 만들고, 8080번 포트에서 대기합니다. 요청이 들어오면 만들어진 워커 프로세스에 요청을 분배합니다._**  
워커 프로세스가 실질적인 일을 하는 프로세스이며 각 워커프로세서가 요청이 들어올 때마다 1초 후에 종료되도록 만들었습니다.

만약 모든 워커가 종료된 후 새로고침을 하면 서버가 응답하지 않습니다. 즉 생성한 워커 프로세스 만큼은 오류가 발생해도 서버가 정상 작동할 수 있다는 뜻입니다. 종료된 워커를 다시 켜면 오류가 발생해도 계속 버틸 수 있습니다.  
다음과 같이 워커 프로세스가 종료되었을 때 새로 하나를 생성해 봅시다.

```
const cluster = require("cluster");
const http = require("http");
const numCPUs = require("os").cpus().length;

if (cluster.isMaster) {
  console.log(`마스터 프로세스 아이디 ${process.pid}`);

  //CPU 개수만큼 워커를 생산
  for (let i = 0; i < numCPUs; i += 1) {
    cluster.fork();
  }

  //워커가 종료되었을 때
  cluster.on("exit", (worker, code, signal) => {
    console.log(`${worker.process.pid}번 워커가 종료되었습니다.`);
    cluster.fork();
  });
} else {
  //워커들이 포트에서 대기
  http
    .createServer((req, res) => {
      res.write("<h1>hello node</h1>");
      res.end("<p>hello cluster</p>");
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    })
    .listen(8080);

  console.log(`${process.pid}번 워커 실행`);
}
```

이제 워커가 죽을 때마다 새로운 워커가 하나 더 생성됩니다. 하지만 이러한 방식으로 오류를 막으려는 것은 좋지 않은 생각입니다. **_그래도 예기치 못한 에러로 인해 서버가 종료되는 현상을 방지할 수 있어 클러스터링을 적용해두는 것이 좋습니다._**

직접 cluster 모듈로 클러스터링을 구현할 수도 있지만, 실무에서는 pm2등의 모듈로 cluster 기능을 사용하곤 합니다.

# 결론 (REST API와 라우팅)

현재 만들었던 restful을 봅시다. 만약 파일이나 자원의 수가 늘어나면 그에 따라 주소의 종류도 많아져야 하며 이미 코드가 상당히 길어 보기도 어렵고 관리하기도 어렵습니다.  
**_이를 편리하게 만들어주는 모듈이 있습니다. 바로 Express 모듈입니다. Express 모듈은 다른 사람들이 만들어둔 모듈이므로 설치해야 사용할 수 있습니다._**  
**_다음 장에서는 다른 사람의 모듈을 설치할 수 있게 해주는 npm에 대해 알아보겠습니다._**
