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

**_시퀄라이즈를 쓰는 이유는 자바스크립트 구문을 알아서 SQL로 바꿔주기 때문입니다. 따라서 SQL 언어를 직접 사용하지 않아도 자바스크립트만으로 MySQL을 조작할 수 있습니다._**

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

---

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
**_sync 메서드를 사용하면 서버 실행 시 알아서 MySQL과 연동됩니다._**

---

### 2. 모델 정의하기

이제 MySQL에서 정의한 테이블을 시퀄라이즈에서도 정의해야 합니다. **_MySQL의 테이블은 시퀄라이즈의 모델과 대응됩니다._**  
시퀄라이즈 모델과 MySQL의 테이블을 연결해주는 역할을 합니다.  
User와 Comment 모델을 만들어 users 테이블과 comments 테이블에 연결해봅시다. **_시퀄라이즈는 기본적으로 모델 이름은 단수형으로, 테이블 이름은 복수형으로 사용합니다._**

시퀄라이즈는 알아서 id를 기본 키로 연결하므로 id 컬럼은 적어줄 필요가 없습니다. sequelize.define 메서드로 테이블명과 각 컬럼의 스펙을 입력합니다.  
MySQL 테이블과 컬럼 내용이 일치해야 정확하게 대응합니다.

시퀄라이즈의 자료형

1. STRING (시퀄라이저 자료형)
   - VARCHAR (MySQL 자료형)
2. INTEGER
   - INT
3. BOOLEAN
   - TINYINT
4. DATE
   - DATETIME
5. INTEGER.UNSIGNED
   - UNSIGNED 옵션이 적용된 INT
   - ZEROFILL 옵션도 사용하고 싶다면 INTEGER.UNSIGNED.ZEROFILL로 사용하면 됩니다.

allowNull은 NOT NULL 옵션과 동일합니다. unique는 UNIQUE 옵션입니다. defaultValue는 기본값(DEFAULT)를 의미합니다.  
DataTypes.NOW로 현재 시간을 기본값으로 사용할 수 있습니다. SQL의 now()와 같습니다.

define 메서드의 세 번째 인자는 테이블 옵션입니다. timestamps 속성의 값이 false로 되어 있습니다. timestamps 속성이 true면 시퀄라이즈는 createdAt과 updatedAt 컬럼을 추가합니다. 로우가 생성될 때와 수정될 때의 시간이 자동으로 입력됩니다. 하지만 예제에서는 직접 created_at 컬럼을 만들었으므로 timestamps 속성이 필요하지 않습니다.

---

### 3. 관계 정의하기

users 테이블과 comments 테이블 간의 관계를 정의해보겠습니다.

#### 1. 1:N 관계

시퀄라이즈에서는 1:N 관계를 hasMany라는 메서드로 표현합니다. users 테이블의 로우 하나를 불러올 때 연결된 comments 테이블의 로우들도 같이 불러올 수 있습니다. 반대로 belongsTo 메서드도 있습니다. comments 테이블의 로우를 불러올 때 연결된 users 테이블의 로우를 가져옵니다.

```
db.User = require("./user")(sequelize, Sequelize);
db.Comment = require("./comment")(sequelize, Sequelize);

db.User.hasMany(db.Comment, { foreignKey: "commenter", sourceKey: "id" });
db.Comment.belongsTo(db.Comment, { foreignKey: "commenter", targetKey: "id" });
```

시퀄라이즈는 테이블 간 관계를 파악해서 commenter 컬럼을 추가하고, 외래 키도 추가합니다. **_외래 키 컬럼은 commenter고 users의 id 컬럼을 가리키고 있습니다._**  
hasMany 메서드에서는 sourceKey 속성에 id를 넣어주고, belongsTo 메서드에서는 targetKey 속성에 id를 넣어줍니다. User 모델의 id가 Comment 모델의 commenter 컬럼에 들어가는 것입니다.

#### 2. 1:1 관계

1:1 관계에서는 hasMany 메서드 대신 hasOne 메서드를 사용합니다. 사용자 정보를 담고 있는 가상의 Info 모델이 있다고 하면 다음과 같이 표현할 수 있습니다.

```
db.User.hasOne(db.Info, {foreignKey: 'user_id', sourceKey: 'id'});
db.Info.belongsTo(db.User, {foreignKey: 'user_id', targetKey: 'id'});
```

belongsTo 와 hasOne이 반대여도 상관 없습니다. 일대일이기 때문입니다.

#### 3. N:M 관계

예로 게시글과 해시태그 모델 간의 다대다(N:M) 관계를 알아보겠습니다.
**_시퀄라이즈에서는 N:M 관계를 표현하기 위해 belongsToMany 메서드가 있습니다._** 게시글 정보를 담고 있는 가상의 Post 모델과 해시태그 정보를 담고 있는 가상의 HashTag 모델이 있다고 하면 다음과 같이 표현할 수 있습니다.

```
db.Post.belongsToMany(db.Hashtag, {through: 'PostHashtag'});
db.Hashtag.belongsToMany(db.Post, {through: 'PostHashtag'});
```

N:M 관계 특성상 새로운 모델이 생성됩니다. **_through 속성에 그 이름을 적어주면 됩니다. 새로 생성된 PostHashtag 모델에는 게시글과 해시태그의 아이디가 저장됩니다._**  
N:M에서는 데이터를 조회할 때 여러 단계를 거쳐야 합니다. 노드 해시태그를 사용한 게시물을 조회하는 경우를 생각해보겠습니다. 먼저 노드 해시태그를 Hashtag 모델에서 조회하고, 가져온 태그의 아이디(1)를 바탕으로 PostHashtag 모델에서 hashtagId가 1인 postId들을 찾아 Post 모델에서 정보를 가져옵니다.

시퀄라이즈는 이 과정을 편하게 할 수 있도록 몇 가지 메서드를 지원합니다.

```
async (req, res, next) => {
  const tag = await Hashtag.find(
    {
      where: {
        title: '노드'
      }
    }
  );

  const posts = await tag.getPosts();
}
```

먼저 해시태그를 찾으면 그 해시태그에서 바로 getPosts 메서드를 사용할 수 있습니다. **_get + 모델 이름의 복수형_** 입니다.

비슷한 것으로 add + 모델 이름의 복수형 메서드도 있습니다. 두 테이블 간 N:M 관계를 추가해줍니다. 다음 코드는 title이 노드인 해시태그와 게시글 아이디가 3인 게시글을 연결하는 코드입니다.

```
async (req, res, next) => {
  const tag = await Hashtag.find(
    {
        where : {
          title: '노드'
        }
    }
  );

  await tag.addPosts(3);
};
```

PostHashtag 모델에 postId가 3이고 hashtagId가 1인 로우가 생성됩니다.

---

### 4. 쿼리 알아보기

시퀄라이즈로 CRUD 작업을 하려면 먼저 시퀄라이즈 쿼리에 대해 알아야 합니다. SQL문을 자바스크립트로 생성하는 것이라 시퀄라이즈만의 방식이 있습니다.  
쿼리는 프로미스를 반환하므로 then을 붙여 결과값을 받을 수 있습니다. async/await 문법과 같이 사용할 수도 있습니다.

1. 로우를 생성하는 쿼리
   - INSERT INTO nodejs.users(name, age, married, comment) VALUES('a', 24, 0, '자기소개1')
   - ```
      const { User } = require('../models');
      User.create({
        name: 'a',
        age: 24,
        married: false,
        comment: '자기소개1'
      });
     ```
   - models 모듈에서 User 모델을 불러와 create 메서드를 사용하면 됩니다.
   - 주의할 점은 데이터를 넣을 때 **_MySQL의 자료형이 아니라 시퀄라이즈 모델에 정의한 자료형대로 넣어야 한다는 것입니다. 이것이 married가 0이 아니라 false인 이유입니다._**
2. 로우를 조회하는 쿼리
   - SELECT \* FROM nodejs.users;
   - ```
      User.findAll({});
     ```
3. 로우 조회 시 Limit
   - SELECT \* FROM nodejs.users LIMIT 1;
   - ```
      User.find({});
     ```
4. 로우 조회 시 원하는 컬럼만 가져오기
   - SELECT name, married FROM nodejs.users;
   - ```
      USER.findAll(
        {
          attributes: ['name', 'married']
        }
      )
     ```
5. 로우 조회 시 Where 조건 사용

   - SELECT name, age FROM nodejs.users WHERE married = 1 AND age > 30;
   - ```
      const { User, Sequelize: { OP } } = require('../models');
      User.findAll({
        attributes: ['name', 'age'],
        where: {
          married: 1,
          age: {
            [Op.gt] : 30
          }
        }
      })
     ```
   - where 옵션이 조건들을 나열하는 옵션입니다. age 부분이 조금 특이한데요. 시퀄라이즈는 자바스크립트 객체를 사용해서 쿼리를 생성해야 하므로 OP.gt 같은 특수한 연산자들이 사용됩니다.
   - OP.gt(초과), Op.gte(이상), Op.lg(미만), Op.lte(이하), OP.ne(같지 않음), OP.or(또는), Op.in(배열 요소 중 하나), Op.notIn(배열 요소와 모두 다름) 등이 존재합니다.
   - SELECT id, name FROM users WHERE married = 0 OR age > 30;
   - ```
      const { User, Sequelize: { OP } } = require('../models');
      User.findAll({
        attributes: ['id', 'name'],
        where : {
          [OP.or]: [{
              married: 0
            }, {
              age: {
                [OP.gt]: 30
              }
            }
          ]
        }
      });

      //Op.or 속성에 OR 연산을 적용할 쿼리들을 배열로 나열하면 됩니다.
     ```

6. 정렬 방식
   - SELECT id, name FROM users ORDER BY age DESC;
   - ```
      const { User, Sequelize: { OP } } = require('../models');
      User.findAll({
        attributes: ['id', 'name'],
        order: [
          ['age', 'DESC']
        ]
      });
     ```
7. 조회할 로우 개수 설정
   - SELECT id, name FROM users ORDER BY age DESC LIMIT 1 OFFSET 1;
   - ```
      const { User } = require('../models');
      User.findAll({
        attributes: ['id', 'name'],
        order: ['age', 'DESC'],
        limit: 1,
        offset: 1,
      });
     ```
8. 로우를 수정하는 쿼리
   - UPDATE nodejs.users SET comment = '바꿀 내용' WHERE id = 2;
   - ```
      const { Users } = require('../models');
      User.update({
        comment: '바꿀 내용',
      }, {
        where : {
          id : 2
        },
      });
     ```
   - 첫 번째 인자는 수정할 내용이고, 두 번째 인자는 수정 대상 로우를 찾는 조건입니다.
9. 로우를 삭제ㄹ하는 쿼리는 다음과 같습니다.
   - DELETE FROM nodejs.users WHERE id = 2;
   - ```
      const { Users } = require('../models');
      User.destroy({
        where : {
          id: 2
        }
      });
     ```

---

### 5. 쿼리 수행하기

모델에서 데이터를 받아서 페이지를 렌더링하는 방법과 JSON 형식으로 데이터를 가져오는 방법 두 가지를 알아보겠습니다.

간단하게 사용자 정보를 등록하고, 사용자가 등록한 댓글을 가져오는 서버입니다.
