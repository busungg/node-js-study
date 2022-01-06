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
        type: DataTypes.STIRNG(100),
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
    console.log(db);
  };

  return model;
};

//provider가 local이면 로컬 로그인을 한 것이고 kakao면 카카오 로그인을 한 것입니다.
//테이블 옵션으로 timestamps와 paranoid가 ture로 주어졌으므로 createdAt, updatedAt, deletedAt 컬럼도 생성됩니다.
