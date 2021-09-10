const db = require('../../models/index');
const { notifyAdminAboutExpiredRequest } = require('../../slackBot/messages');

exports.default = async function notifyAdminInSlackAboutExpiredRequests() {
  try {
    const activeRequests = await db.request.findAll({
      where: {
        status: {
          [db.Sequelize.Op.or]: ['inProgress', 'wait'],
        },
      },
    });

    for (let i = 0; i < activeRequests.length; i += 1) {
      const request = activeRequests[i];
      let requestStartDate = null;

      // eslint-disable-next-line default-case
      switch (request.type) {
        case 'technical':
        case 'common':
        case 'documents':
          requestStartDate = request.dateTo;
          break;

        case 'medical':
          requestStartDate = request.dateFrom;
          break;
        case 'vacation':
          requestStartDate = request.dateFrom;
          break;

        case 'dayOff':
          [requestStartDate] = request.dates;
          break;
      }

      if (new Date() > requestStartDate) {
        notifyAdminAboutExpiredRequest(request);
        console.log('Просрочка');
      }
    }
  } catch (err) {
    console.error(err);
  }
};

// at 11:00 everyday
module.exports.cronExpression = '0 11 * * *';
