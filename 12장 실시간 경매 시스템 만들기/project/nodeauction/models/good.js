module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    "good",
    {
      name: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      img: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );

  model.associate = (db) => {
    model.belongsTo(db.User, { as: "owner" });
    model.belongsTo(db.User, { as: "sold" });
    model.hasMany(db.Auction);
  };

  return model;
};
