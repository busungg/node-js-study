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

설치 후 Passport 모듈을 미리 app.js와 연결합시다. Passport 모듈은 조금 뒤에 만듭니다.

```
const passport = require("passport");
const flash = require("connect-flash");
require("dotenv").config();

const pageRouter = require("./routes/page");
const { sequelize } = require("./models");
const passportConfig = require("./passport");

const app = express();
sequelize.sync();
passportConfig(passport);

...
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
app.use(flash());
app.use(passport.initialize());
app.use(passport.session);
```

**_require('./passport') 는 require('./passport/index.js')와 같습니다._** 폴더 내의 index.js 파일은 require시 이름을 생략할 수 있습니다.  
passport.initialize() 미들웨어는 요청(req 객체)에 passport 설정을 심고, **_passport.session() 미들웨어는 req.session 객체에 passport 정보를 저장합니다. req.session 객체는 express-session에서 생성하는 것이므로 passport 미들웨어는 express-session 미들웨어보다 뒤에 연결해야 합니다._**

이제 app.js와 연결했던 Passport 모듈을 작성합니다.

```
const local = require("./localStrategy");
const kakao = require("./kakaoStrategy");
const { user } = require("../models");

module.exports = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    user
      .find({
        where: { id },
      })
      .then((user) => done(null, user))
      .catch((err) => done(err));
  });

  local(passport);
  kakao(passport);
};
```

모듈 내부를 보면 passport.serializeUser와 passport.deserializeUser가 있습니다. 이 부분이 Passport를 이해하는 핵심입니다.

serializeUser는 req.session 객체에 어떤 데이터를 저장할 지 선택합니다. 매개변수로 user를 받아, done 함수에 두 번째 인자로 user.id를 넘기고 있습니다. done 함수의 첫 번째 인자는 에러 발생 시 사용하는 것이므로 두 번째 인자가 중요합니다. 세션에 사용자 정보를 모두 저장하면 세션의 용량이 커지고 데이터 일관성에 문제가 발생하므로 사용자의 아이디만 저장하라고 명령한 것입니다.

deserializeUser는 매 요청 시 실행됩니다. passport.session() 미들웨어가 이 메서드를 호출합니다.  
좀 전에 serializeUser에서 세션에 저장했던 아이디를 받아 데이터베이스에서 사용자 정보를 조회합니다.  
조회한 정보를 req.user에 저장하므로 앞으로 req.user를 통해 로그인한 사용자의 정보를 가져올 수 있습니다.

즉 serializeUser는 사용자 정보 객체를 세션에 아이디로 저장하는 것이고, deserializeUser는 세션에 저장한 아이디를 통해 사용자 정보 객체를 불러오는 것입니다. 세션에 불필요한 데이터를 담아두지 않기 위한 과정입니다.

전체 과정은 다음과 같습니다.

1. 로그인 요청이 들어옴
2. passport.authenticate 메서드 호출
3. 로그인 전략 수행
4. 로그인 성공 시 사용자 정보 객체와 함께 req.login 호출
5. req.login 메서드가 passport.serializeUser 호출
6. req.session에 사용자 아이디만 저장
7. 로그인 완료

다음은 로그인 이후의 과정입니다.

1. 모든 요청에 passport.session() 미들웨어가 passport.deserializeUser 메서드 호출
2. req.session에 저장된 아이디로 데이터베이스에서 사용자 조회
3. 조회된 사용자 정보를 req.user에 저장
4. 라우터에서 req.user 객체 사용 가능

### 1. 로컬 로그인 구현하기

로컬 로그인이란 다른 SNS 서비스를 통해 로그인하지 않고, 자체적으로 회원가입 후 로그인하는 것을 의미합니다. 즉, 아이디/비밀번호 또는 이메일/비밀번호를 통해 로그인하는 것입니다.  
Passport에서 이를 구현하려면 passport-local 모듈이 필요합니다. 이미 설치했으므로 로컬 로그인 전략만 세우면 됩니다. 로그인에만 해당하는 전략이므로 회원가입은 따로 만들어야 합니다.

회원가입, 로그인, 로그아웃 라우터를 먼저 만들어봅시다. 이러한 라우터는 접근 조건이 있습니다.  
로그인한 사용자는 회원가입과 로그인 라우터에 접근하면 안됩니다. 마찬가지로 로그인하지 않은 사용자는 로그아웃 라우터에 접근하면 안됩니다. **_따라서 라우터에 접근 권한을 제어하는 미들웨어가 필요합니다. 미들웨어를 만들며 Passport가 req 객체에 추가해주는 isAuthenticated 메서드를 알아봅시다._**

```
exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send("로그인 필요");
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/");
  }
};
```

Passport는 req 객체에 isAuthenticated 메서드를 추가합니다. 로그인 중이면 req.isAuthenticated()가 true고, 아니면 false 입니다. 따라서 로그인 여부를 이 메서드로 파악할 수 있습니다.

# Multer 모듈로 이미지 업로드 구현하기

이미지는 보통 input[type=file] 태그와 form 태그를 통해서 업로드합니다.  
이때 form의 인코딩 타입은 multipart/form-data인 경우가 많습니다. 이런 형식으로 올라온 데이터는 직접 처리하기 힘드므로 multipart 처리용 모듈을 사용하는 것이 좋습니다.

이미지를 어떻게 저장할 것인지는 서비스의 특성에 따라 달라집니다.  
test project는 input 태그를 통해 이미지를 선택할 때 먼저 업로드를 진행하고,  
업로드된 사진 주소를 다시 클라이언트에 알려 줄 것입니다.  
게시글 저장 시에는 이미지 데이터 대신 이미지 주소를 저장합니다.
