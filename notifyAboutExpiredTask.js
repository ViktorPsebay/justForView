const moment = require('moment');
const db = require('../../models/index');
const { calendarGenerator } = require('../calendar/calendarGenerator');
const config = require('../../config/index');
const { notifyManagersAboutExpiredTask, notifyMentorAboutExpiredTask } = require('../../slackBot/messages');

const messageFormation = (user, delay, title, mentor) => {
  let nameUser;
  if (user.slack_conversational_id) {
    nameUser = user.slack_conversational_id;
  } else if (user.firstName === null || user.lastName === null) {
    nameUser = user.login;
  } else {
    nameUser = `${user.firstName} ${user.lastName}`;
  }

  let nameMentor;
  if (mentor.slack_conversational_id) {
    nameMentor = mentor.slack_conversational_id;
  } else if (mentor.firstName === null || mentor.lastName === null) {
    nameMentor = mentor.login;
  } else {
    nameMentor = `${mentor.firstName} ${mentor.lastName}`;
  }

  let formOfWordDay;
  const condition = delay % 100;
  if (condition > 10 && condition < 15) {
    formOfWordDay = 'дней';
  } else if (condition % 10 === 1) {
    formOfWordDay = 'день';
  } else if (condition % 10 > 1 && condition % 10 < 5) {
    formOfWordDay = 'дня';
  } else {
    formOfWordDay = 'дней';
  }

  return `${mentor.slack_conversational_id ? `<@${nameMentor}>` : ''} Напоминание. У ${user.slack_conversational_id
    ? `<@${nameUser}>`
    : nameUser} просрочена задача '${title}' на ${delay} ${formOfWordDay}`;
};

const getWorkDays = (dateOfStart) => {
  const { dates } = calendarGenerator.calendar;
  const dateOfNow = new Date();
  const year = moment(dateOfStart).get('year');

  const diffStartNow = moment(dateOfNow).startOf('d').diff(moment(dateOfStart).startOf('d'), 'd');
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
      workdays += (moment(date, 'DD-MM_YYYY').format('d') === '0' || moment(date, 'DD-MM_YYYY').format('d') === '6') ? 0 : 1;
    }
    date = moment(date, 'DD-MM_YYYY').add(1, 'days').format('DD-MM_YYYY');
  }

  return workdays;
};


exports.default = async function notifyExpiredTask() {
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
        { model: db.taskJob, attributes: ['time_limits', 'title'] },
      ],
    });

    const { acceptableDelay } = config;

    for (const task of activeTasks) {
      const { time_limits, title } = task.taskJob;
      const { startTask } = task;

      const workDays = getWorkDays(startTask);

      if (workDays > time_limits) {
        const res = await db.plan.findOne({
          include: { model: db.user },
          where: { id: task.plan_id },
        });

        const user = res.users[0];
        const mentor = await db.user.findOne({
          where: { id: user.mentor_id },
          attributes: ['firstName', 'lastName', 'login', 'slack_conversational_id'],
        });

        const message = messageFormation(
          user,
          workDays - time_limits,
          title,
          mentor
        );

        if (
          workDays > Math.ceil(time_limits * acceptableDelay + time_limits)
          || !mentor.slack_conversational_id
        ) {
          notifyManagersAboutExpiredTask(message);
        } else {
          notifyMentorAboutExpiredTask(mentor.slack_conversational_id, message);
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
};

// at 10:00 everyday
module.exports.cronExpression = '0 10 * * *';
