module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    "domain",
    {
      host: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      clientSecret: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
    },
    {
      //데이터를 추가로 검증하는 소것ㅇ입니다.
      //또한 unkownType이라는 이름의 검증기를 만들었습니다. 종류로는 free나 premium만 선택할 수 있습니다.
      validate: {
        unknownType() {
          console.log(this.type, this.type !== "free", this.type !== "premium");
          if (this.type !== "free" && this.type !== "premium") {
            throw new Error("type 컬럼은 free나 premium이어야 합니다.");
          }
        },
      },
      timestamps: true,
      paranoid: true,
    }
  );

  model.associate = (db) => {
    model.belongsTo(db.user);
    db.user.hasMany(model);
  };

  return model;
};
