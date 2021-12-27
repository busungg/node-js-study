# 데이터베이스란?
데이터베이스는 관련성을 가지며 중복이 없는 데이터들의 집합입니다. 이러한 데이터베이스를 관리하는 시스템을 DBMS(데이터베이스 관리 시스템)라고 부릅니다.  

보통 서버의 하드 디스크나 SSD등의 저장 매체에 데이터를 저장합니다. 저장 매체가 고장나거나 사용자가 직접 데이터를 지우지 않는 이상 계속 데이터가 보존되므로 서버 종료 여부와 상관없이 데이터를 계속 사용할 수 있습니다.

# 데이터베이스 생성하기
```
CREATE SCHEMA nodejs;
use nodejs;
```
CREATE CHEMA [데이터베이스명]
use nodejs; 명령어는 nodejs 데이터베이스를 사용하겠다는 것을 My SQL에 알립니다.

SQL 구문을 입력할 때는 마지막에 세미콜론을 붙여야 실행됩니다. 세미콜론을 붙이지 않으면 프롬프트가 다음 줄로 넘어가서 다른 입력이 들어오기를 계속 기다립니다.

# 테이블 생성하기
```
    CREATE TABLE nodejs.users (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(20) NOT NULL,
        age INT UNSIGNED NOT NULL,
        married TINYINT NOT NULL,
        comment TEXT NULL,
        created_at DATETIME NOT NULL DEFAULT now(),
        PRIMARY KEY(id),
        UNIQUE INDEX name_UNIQUE (name ASC)
    )
    COMMENT = '사용자 정보'
    DEFAULT CHARSET=utf8
    ENGINE=InnoDB;

    CREATE TABLE nodejs.comments (
        id INT NOT NULL AUTO_INCREMENT,
        commenter INT NOT NULL,
        comment VARCHAR(100) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT now(),
        PRIMARY KEY(id),
        INDEX commenter_idx (commenter ASC),
        CONSTRAINT commenter
        FOREIGN KEY (commenter)
        REFERENCES nodejs.users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    )
    COMMENT = '댓글'
    DEFAULT CHARSET=utf8
    ENGINE=InnoDB;
```

# CRUD 작업하기
```
INSERT INTO nodejs.users(
    name,
    age,
    married,
    comment
)
VALUES
(
    'a',
    24,
    0,
    '자기소개1'
);

INSERT INTO nodejs.users(
    name,
    age,
    married,
    comment
)
VALUES
(
    'b',
    32,
    1,
    '자기소개2'
);

INSERT INTO nodejs.comments(
    commenter,
    comment
)
VALUES
(
    1,
    '안녕하세요 첫 댓글입니다.'
);
```

# 시퀄라이즈 사용하기
노드에서 MySQL 데이터베이스에 접속해봅시다. MySQL 작업을 쉽게 할 수 있도록 도와주는 라이브러리가 있습니다. 바로 Sequelize(이하 시퀄라이즈)입니다.

시퀄라이즈는 ORM(Object-relational Mapping)으로 분류됩니다. ORM은 자바스크립트 객체와 데이터베이스의 릴레이션을 매핑해주는 도구입니다.

시퀄라이즈를 MySQL하고만 같이 써야 하는 것은 아닙니다. MariaDB, PostgreSQL, SQLite, MSSQL 등 다른 데이터베이스도 같이 쓸 수 있습니다. 문법이 어느 정도 호환되므로 다른 SQL 데이터베이스로 전환할 때도 편리합니다.

***시퀄라이즈를 쓰는 이유는 자바스크립트 구문을 알아서 SQL로 바꿔주기 때문입니다. 따라서 SQL 언어를 직접 사용하지 않아도 자바스크립트만으로 MySQL을 조작할 수 있습니다.***

시퀄라이즈에 필요한 sequelize와 mysql2 패키지를 설치합니다. 그 후 sequelize 커맨드를 사용하기 위해 sequelize-cli를 전역 설치합니다. 설치 완료 후 sequelize init 명령어를 호출하면 됩니다.
```
npm i sequelize mysql2
npm i -g sequelize-cli
sequelize init
```

sequelize init 명령어 호출 시 config, models, migrations, seeders 폴더가 생성되었습니다. sequlize-cli가 자동으로 생성해주는 코드는 그대로 사용했을 때 에러가 발생하고, 필요 없는 부분도 많으므로 다음과 같이 수정합니다.

```
//수정한 models/index.js

const path = require('path');
const Sequelize = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '..', 'config', 'config.json'))[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
```

```
//기존 models/index.js

'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
```

### 1. MySQL 연결하기
이제 시퀄라이즈를 통해 익스프레스 앱과 MySQL을 연결해야 합니다. app.js에서 추가해줍니다.

```
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var sequelize = require('./models').sequelize;

var app = express();
sequelize.sync();
```
require('./models/)는 require('./models/index.js')와 같습니다. 폴더 내의 index.js 파일은 require 시 이름을 생략할 수 있습니다.
***sync 메서드를 사용하면 서버 실행 시 알아서 MySQL과 연동됩니다.***

### 2. 모델 정의하기
이제 MySQL에서 정의한 테이블을 시퀄라이즈에서도 정의해야 합니다. ***MySQL의 테이블은 시퀄라이즈의 모델과 대응됩니다.***