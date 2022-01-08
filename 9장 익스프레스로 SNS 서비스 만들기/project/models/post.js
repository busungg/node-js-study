module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    "post",
    {
      content: {
        type: DataTypes.STRING(140),
        allowNull: false,
      },
      img: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );

  model.associate = (db) => {
    model.belongsTo(db.user);
    //post와 hashtag 모델에서 N:M(다대다) 관계가 나옵니다.
    //게시글 하나는 해시태그를 여러 개 가질 수 있고, 해시태그 하나도 게시글을 여러 개 가질 수 있습니다.
    //따라서 게시글 모델과 해시태그 모델은 N:M관계에 있으므로 시퀄라이즈에서는 N:M관계를 belongsToMany 메서드로 정의합니다.
    //N:M 관계에서는 중간에 관계 테이블이 생성됩니다.  Surrogate table을 사용하여 처리합니다.
    model.belongsToMany(db.hashtag, { through: "PostHashtag" });
  };

  return model;
};
