# 프로젝트 구조 갖추기

직접 구조를 생성하며 구조를 익혀보겠습니다.

1.  항상 package.json을 제일 먼저 생성해야 합니다. package.json을 생성하는 **_npm init 명령어_** 를 콘솔에서 호출해도 되고 직접 만들어도 됩니다. 이때 scripts 부분에 start 속성은 잊지 말고 넣어줘야 합니다.

2.  두번째로는 시퀄라이즈를 설치하고 초기화 하겠습니다.

    ```
    npm i -g sequelize-cli
    npm i sequelize mysql2
    sequelize init
    ```

    - sequelize init을 호출하면 config, migrtions, models, seeders 폴더가 생성됩니다.

3.  다른 폴더도 생성합니다.

    - 템플릿 파일을 넣을 views 폴더
    - 라우터를 넣을 routes 폴더
    - 정적파일을 넣을 public 폴더
    - passport 패키지를 위한 passport 폴더도 만들어 줍니다.

4.  마지막으로 익스프레스 서버 코드가 담길 app.js root 폴더 안에 생성합니다.

5.  이 구조는 고정된 구조가 아니므로 편의에 따라 바꿔도 됩니다. 서비스가 성장하고 규모가 커질수록 폴더 구조도 복잡해지므로 각자 서비스에 맞는 구조를 적용해야 합니다.

6.  필요한 npm 패키지들을 설치하고 app.js를 작성합니다. 템플릿 엔진은 pug를 사용할 것입니다.

    - ```
         npm i express cookie-parser express-session morgan connect-flash pug
         npm i -g nodemon
         npm i -D nodemon
      ```
    - 서버 코드에 수정 사항이 생길 때마다 매번 서버를 재시작하기는 귀찮으므로 nodemon 모듈로 서버를 자동 재시작합니다. 앞으로 서버 코드를 수정하면 nodemon이 서버를 자동으로 재시작 해줍니다. nodemon이 실행되는 콘솔에 rs를 입력해서 수동으로 재시작할 수도 있습니다. nodemon은 개발용으로만 사용할 것을 권장합니다. 배포 후에는 서버 코드가 빈번하게 변경될 일이 없으므로 nodemon을 사용하지 않아도 됩니다.

7.  app.js를 구성해 봅시다.

    - ```
         const express = require("express");
         const cookieParser = require("cookie-parser");
         const morgan = require("morgan");
         const path = require("path");
         const session = require("express-session");
         const flash = require("connect-flash");
         const pageRouter = require("./routes/page");

         const app = express();

         app.set("views", path.join(\_\_dirname, "views"));
         app.set("view engine", "ejs");
         app.set("port", process.env.PORT || 3000);

         //미들웨어
         app.use(morgan("dev"));
         app.use(express.static(path.join(\_\_dirname, "public")));
         app.use(express.json());
         app.use(express.urlencoded({ extended: false }));
         app.use(cookieParser("projectsecret"));
         app.use(
             session({
                 resave: false,
                 saveUninitialized: false,
                 secret: "projectsecret",
                 cookie: {
                     httpOnly: true,
                     secure: false,
                 },
             })
         );
         app.use(flash());

         app.use("/", pageRouter);
         app.use((req, res, next) => {
             const err = new Error("Not Found");
             err.status = 404;
             next(err);
         });

         app.use((err, req, res, next) => {
             res.locals.message = err.message;
             res.locals.error = req.app.get("env") === "development" ? err : {};
             res.status(err.status || 500);
             res.render("error");
         });

         app.listen(app.get("port"), () => {
             console.log(app.get("port"), "번 포트에서 대기 중");
         });
      ```

    - 이 프로젝트를 콘솔에서 실행 가능한 명령어로 만들 필요가 없으므로 **_bin/www_** 는 필요하지 않습니다.
    - 이제부터 cookieParser와 express-session의 projectsecret 같은 비밀키는 직접 하드코딩하지 않습니다. 키를 하드코딩하면 소스 코드가 유출되었을 때 키도 같이 유출되므로 별도로 관리해야 합니다. 이를 위한 패키지가 dotenv입니다. 비밀키는 .env라는 파일에 모아두고, dotenv가 .env 파일을 읽어 process.env 객체에 넣습니다.

      ```
        npm i dotenv
      ```

      **_.env 파일을 생성합니다. 파일명 앞에 점(.)이 붙었다는 것에 주의하세요.
      app.js에 require('dotenv').config()를 호출하면 됩니다. 서버 시작 시 .env의 비밀키들을 process.env에 넣으므로 이후로 process.env.COOKIE_SECRET처럼 키를 사용할 수 있습니다. 앞으로 .env만 유출되지 않게 관리하면 됩니다._**

      ```
        require("dotenv").config();

        ...
        ...

        app.use(cookieParser(process.env.COOKIE_SECRET));
        app.use(
        session({
            resave: false,
            saveUninitialized: false,
            secret: process.env.COOKIE_SECRET,
            cookie: {
            httpOnly: true,
            secure: false,
            },
        })
        );
      ```

      하지만 하드코딩된 비밀번호가 유일하게 남아 있는 파일이 있습니다. 시퀄라이즈 설정을 담아둔 config.json입니다. JSON이라 process.env를 사용할 수 없습니다. 시퀄라이즈의 비밀번호를 숨기는 방법은 추후에 알아봅시다.

8.  기본적인 라우터와 템플릿 엔진도 만들어 봅시다.

# 데이터베이스 세팅하기

1. **_같은 테이블 간 N:M 관계_**
   - 모델 이름과 컬럼 이름을 따로 정해주어야 합니다. 모델 이름이 UserUser일 수는 없기에 through 옵션으로 생성할 모델 이름을 Follow로 정했습니다.
   - Follow 모델에서 사용자 아이디를 저장하는 컬럼 이름이 둘 다 userId면 누가 팔로워고 누가 팔로잉 중인지 구분이 되지 않으므로 따로 설정해주어야 합니다. foreignKey 옵션에 각각 followerId, followingId를 넣어주어 두 사용자 아이디를 구별했습니다.
   - as 옵션은 시퀄라이즈가 JOIN 작업 시 사용하는 이름입니다. as에 등록한 이름을 바탕으로 시퀄라이즈는 getFollowings, getFollowers, addFollowing, addFollower 등의 메서드를 자동으로 추가 합니다.

# Passport 모듈로 로그인 구현하기

회원가입과 로그인은 직접 구현할 수도 있지만, 세션과 쿠키 처리 등 복잡한 작업이 많으므로 검증된 모듈을 사용하는 것이 좋습니다. 바로 Passport를 사용하는 것입니다. 이름처럼 우리의 서비스를 사용할 수 있게 해주는 여권 역할을 합니다.

요즘에는 서비스에 로그인을 할 때 SNS 서비스 계정으로 로그인하기도 합니다. 이 또한 Passport를 사용해서 해결할 수 있습니다.

먼저 Passport 관련 패키지들을 설치합니다.

```
npm i passport passport-local passport-kakao bcrypt
```
