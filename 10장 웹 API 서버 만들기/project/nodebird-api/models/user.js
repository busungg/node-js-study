module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    "user",
    {
      email: {
        type: DataTypes.STRING(40),
        allowNull: true,
        unique: true,
      },
      nick: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      provider: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "local",
      },
      snsId: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );

  model.associate = (db) => {
    //user 모델과 post 모델은 1:N 관계에 있으므로 hasMany와 belongsTo로 연결되어 있습니다.
    //시퀄라이즈는 Post 모델에 userId 컬럼을 추가합니다.
    model.hasMany(db.post);

    //같은 테이블끼리도 N:M 관계를 가질 수 있습니다.
    //팔로잉 기능도 N:M 관계입니다. 사용자 한 명이 팔로워를 여러 명 가질 수도 있고
    //여러 명을 팔로잉할 수도 있습니다. User 모델과 User 모델간에 N:M 관계가 있는 겁니다.
    model.belongsToMany(db.user, {
      foreignKey: "followingId",
      as: "Followers",
      through: "Follow",
    });
    model.belongsToMany(db.user, {
      foreignKey: "followerId",
      as: "Followings",
      through: "Follow",
    });
  };

  return model;
};

//provider가 local이면 로컬 로그인을 한 것이고 kakao면 카카오 로그인을 한 것입니다.
//테이블 옵션으로 timestamps와 paranoid가 ture로 주어졌으므로 createdAt, updatedAt, deletedAt 컬럼도 생성됩니다.
