const moment = require('moment');
const db = require('../../models');

const { Op } = db.Sequelize;

const EXPIRATION_TIME_IN_DAYS = 30 * 3;

exports.default = async function cleanApplies() {
  try {
    await db.crm_tasks.destroy({
      where: {
        proposal: true,
        contract: false,
        createdAt: {
          [Op.lte]: moment().subtract(EXPIRATION_TIME_IN_DAYS, 'days').toDate(),
        },
      },
    });
  } catch (err) {
    console.error(err);
  }
};

// at 11:00 everyday
module.exports.cronExpression = '0 11 * * *';
