module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    "hashtag",
    {
      title: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: true,
      },
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );

  model.associate = (db) => {
    model.belongsToMany(db.post, { through: "PostHashtag" });
  };

  return model;
};
