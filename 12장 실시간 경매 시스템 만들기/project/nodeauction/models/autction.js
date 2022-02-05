module.exports = (sequelize, DataTypes) => {
  const model = sequelize.define(
    "auction",
    {
      bid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      msg: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
    },
    {
      timestamps: true,
      paranoid: true,
    }
  );

  model.associate = (db) => {
    model.belongsTo(db.User);
    model.belongsTo(db.Good);
  };

  return model;
};
