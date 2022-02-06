const { Good, Auction, User, sequelize } = require("./models");

module.exports = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    console.log("checkAuction.js", yesterday);
    const targets = await Good.findAll({
      where: {
        soldId: null,
        createdAt: { $lte: yesterday },
      },
    });

    console.log("==========================================");
    console.log("checkAuction.js - targets", targets);
    console.log("==========================================");

    targets.forEach(async (target) => {
      const success = await Auction.find({
        where: { goodId: target.id },
        order: [["bid", "DESC"]],
      });

      await Good.update(
        { soldId: success.userId },
        { wehre: { id: target.id } }
      );

      await User.update(
        {
          money: sequelize.literal(`money - ${success.bid}`),
        },
        {
          where: { id: success.userId },
        }
      );
    });
  } catch (error) {
    console.error(error);
  }
};
