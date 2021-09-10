const moment = require('moment');
const db = require('../../models/index');
const { calendarGenerator } = require('../calendar/calendarGenerator');
const config = require('../../config/index');

// const {
//   notifyMentorAboutExpiredTaskDeadline,
// } = require('../../slackBot/messages');

const getWorkDays = (dateOfStart) => {
  const { dates } = calendarGenerator.calendar;
  const dateOfNow = new Date();
  const year = moment(dateOfStart).get('year');

  console.log(`year of start - ${year}`);

  const diffStartNow = moment(dateOfNow).startOf('d').diff(moment(dateOfStart).startOf('d'), 'd');
  console.log(`days from start task to now - ${diffStartNow}`);

  const yearOfFinish = moment(dateOfNow).get('year');

  let datesNormalize = dates[year].reduce((combo, item) => {
    combo[item.day] = item.is_holiday;
    return combo;
  }, {});

  if (year !== yearOfFinish) {
    datesNormalize = dates[yearOfFinish].reduce((combo, item) => {
      combo[item.day] = item.is_holiday;
      return combo;
    }, datesNormalize);
  }

  let date = moment(dateOfStart).format('DD-MM_YYYY');
  let workdays = 0;
  for (let i = 0; i <= diffStartNow; i += 1) {
    if (date in datesNormalize) {
      workdays += datesNormalize[date] ? 0 : 1;
    } else {
      console.log(moment(date, 'DD-MM_YYYY').format('d'));
      workdays += (moment(date, 'DD-MM_YYYY').format('d') === '0' || moment(date, 'DD-MM_YYYY').format('d') === '6') ? 0 : 1;
    }
    date = moment(date, 'DD-MM_YYYY').add(1, 'days').format('DD-MM_YYYY');
  }

  return workdays;
};


exports.default = async function notifyExpiredTaskDeadline() {
  try {
    const activeTasks = await db.plan_taskJob.findAll({
      where: {
        startTask: {
          [db.Sequelize.Op.not]: null,
        },
        finishTask: {
          [db.Sequelize.Op.is]: null,
        },
      },
      include: [
        { model: db.taskJob, attributes: ['time_limits'] },
      ],
    });

    const { acceptableDelay } = config;

    for (const task of activeTasks) {
      const { time_limits } = task.taskJob;
      const { startTask } = task;
      console.log(startTask);
      console.log(new Date());

      console.log(`time limit - ${time_limits}`);

      const workDays = getWorkDays(startTask);
      console.log(`workdays - ${workDays}`);
      if (workDays > time_limits) {
        const res = await db.plan.findOne({
          include: { model: db.user, attributes: ['id', 'lastName', 'mentor_id'] },
          where: { id: task.plan_id },
        });
        // notifyMentorAboutExpiredTaskDeadline(res.user);
        res.users.map(user => console.log(user));
        console.log('Просрочка');

        console.log(Math.ceil(time_limits * acceptableDelay + time_limits));
        if (workDays > Math.ceil(time_limits * acceptableDelay + time_limits)) {
          console.log('Большая просрочка');
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
};

// at 10:00 everyday
module.exports.cronExpression = '0 10 * * *';
