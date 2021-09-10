const db = require('../../models/index');
const { notifyAdminAboutBirthday } = require('../../slackBot/messages');

exports.default = async function notifyAdminInSlackAboutUsersBirthdays() {
  try {
    const users = await db.user.findAll({
      where: {
        DoB: {
          [db.Sequelize.Op.not]: null,
        },
      },
    });

    for (let i = 0; i < users.length; i += 1) {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentDatePlusOneWeek = +currentDate + 604800000;
      const userBirthdayInTheYear = users[i].dataValues.DoB.setFullYear(currentYear);
      if (
        currentDate < new Date(userBirthdayInTheYear)
        && new Date(currentDatePlusOneWeek) > new Date(userBirthdayInTheYear)
      ) {
        notifyAdminAboutBirthday(users[i]);
      }
    }
  } catch (err) {
    console.error(err);
  }
};

// every monday and friday at 12:00
module.exports.cronExpression = '0 12 * * 1,5';
