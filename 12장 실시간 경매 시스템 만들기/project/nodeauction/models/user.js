module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    "user",
    {
      email: {
        type: DataTypes.STRING(40),
        allowNull: false,
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
      money: {
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
    model.hasMany(db.Auction);
  };

  return model;
};
