/* eslint-disable default-case */
const { rtm } = require('./index');
const config = require('../config/index');
const { getUserName } = require('../utils');
const { paramsNames } = require('../utils/constants');
const SlackMessageGenerator = require('../utils/SlackMessageGenerator');

const notifyAboutNewRequestOrExtra = async (request) => {
  let typeRequest = 'отправил ';
  let nameUser;
  let link = `${config.siteAddress}/requestsList`;

  // eslint-disable-next-line default-case
  switch (request.type) {
    case 'technical':
      typeRequest += `техническую заявку: ${request.title}`;
      break;
    case 'common':
      typeRequest += `бытовую заявку: ${request.title}`;
      break;
    case 'documents':
      typeRequest += `заявку на документы: ${request.title}`;
      break;
    case 'dayOff':
      typeRequest += 'заявку на отгул';
      break;
    case 'vacation':
      typeRequest += 'заявку на отпуск';
      break;
    case 'medical':
      typeRequest += 'заявку на больничный';
      break;
    case 'extraHours':
      typeRequest = `добавил запись о переработке: \n"${request.description}"`;
      link = `${config.siteAddress}/extra`;
  }
  const { firstName, lastName, login } = request.users[0].dataValues;

  if (firstName == null || lastName == null) {
    nameUser = login;
  } else {
    nameUser = `${firstName} ${lastName}`;
  }

  const textMessage = `Пользователь ${nameUser} ${typeRequest}. \n${link}`;

  try {
    const data = {
      channel: config.conversationId,
      text: textMessage,
    };

    const res = await rtm.sendToChat(data);
    console.log('Message sent: ', res.ts);
  } catch (err) {
    console.error('', err);
  }
};

const sendAdInGeneral = async (inputData = {}) => {
  try {
    const {
      title = '', image = '', user = {}, visitDate = '', id = '',
    } = inputData;

    const data = {
      channel: config.generalId,
      text: `<!everyone>\n${SlackMessageGenerator.newAnnouncement}`,
      attachments: [
        {
          fields: [
            {
              title: 'Событие',
              value: `<${config.siteAddress}/home?${paramsNames.announcementsId}=${id}|${title}>`,
              short: true,
            },
            {
              title: 'Когда',
              value: `${visitDate ? visitDate.substr(0, 15) : 'Сейчас'}`,
              short: true,
            },
          ],
          author_name: `Автор: ${getUserName(user)}`,
          author_icon: user.avatarThumbnail || `${config.url}${user.avatar}`,
          image_url: `${config.url}${image}`,
        },
      ],
    };

    if (config.generalId) {
      const res = await rtm.sendToChat(data);
      console.log('Message sent: ', res.ts);
    }
  } catch (err) {
    console.error(err);
  }
};

const notifyUserAboutHisRequest = async (request) => {
  let statusRequest;

  switch (request.status) {
    case 'inProgress':
      statusRequest = 'Выполняется';
      break;
    case 'completed':
      statusRequest = 'Выполнена';
      break;
    case 'accept':
      statusRequest = 'Одобрена';
      break;
    case 'denied':
      statusRequest = 'Отклонена';
      break;

    default:
      statusRequest = 'Обновлена';
      break;
  }

  let textMessage;
  if (!request.dataValues.deniedComment) {
    textMessage = `У вашей заявки (${request.title}) - новый статус: ${statusRequest}`;
  } else {
    textMessage = `К сожалению, ваша заявка (${request.title})  отклонена. Комментарий: ${request.dataValues.deniedComment}`;
  }

  try {
    const {
      role: recipientRole,
      slack_conversational_id: userSlackConversationalId,
    } = request.users[0].dataValues;

    if (userSlackConversationalId != null) {
      const data = {
        channel: userSlackConversationalId,
        text: textMessage,
      };

      const res = await rtm.sendToChat(data, recipientRole);
      console.log('Message sent: ', res);
    } else {
      console.error("We don't have the user's slack_id. Notification wasn't sent.");
      return false;
    }
  } catch (err) {
    console.error(err);
  }
};

const notifyAdminAboutExpiredRequest = async (request) => {
  let typeRequest = null;

  switch (request.type) {
    case 'technical':
      typeRequest = 'техническая заявка';
      break;
    case 'dayOff':
      typeRequest = 'заявка на отгул';
      break;
    case 'vacation':
      typeRequest = 'заявка на отпуск';
      break;
    case 'medical':
      typeRequest = 'заявка на больничный';
      break;
    case 'common':
      typeRequest = 'бытовая заявка';
      break;
    case 'documents':
      typeRequest = 'заявка на документы';
      break;
  }
  let message = `:alarm_clock: Имеется просроченная ${typeRequest}. \n`;
  if (request.title) {
    message += `Заголовок: ${request.title}. \n`;
  }
  if (request.comment) {
    message += `Комментарий: ${request.comment}. `;
  }
  const data = {
    channel: config.conversationId,
    text: message,
  };

  await rtm.sendToChat(data);
};

const notifyAdminAboutBirthday = async (user) => {
  const date = user.DoB;
  const day = date.getDate();

  let month = null;

  switch (date.getMonth()) {
    case 0:
      month = 'января';
      break;
    case 1:
      month = 'февраля';
      break;
    case 2:
      month = 'марта';
      break;
    case 3:
      month = 'апреля';
      break;
    case 4:
      month = 'мая';
      break;
    case 5:
      month = 'июня';
      break;
    case 6:
      month = 'июля';
      break;
    case 7:
      month = 'августа';
      break;
    case 8:
      month = 'сентября';
      break;
    case 9:
      month = 'октября';
      break;
    case 10:
      month = 'ноября';
      break;
    case 11:
      month = 'декабря';
      break;
  }

  const message = `Напоминание. У ${user.firstName} ${user.lastName} день рождения ${day} ${month}. А это уже скоро :) `;

  const data = {
    channel: config.conversationId,
    text: message,
  };

  await rtm.sendToChat(data);
};

const notifyTeamAboutUnreviewedPRs = async (listOfPR) => {
  try {
    const textMessage = listOfPR.reduce(
      (text, el) => `${text}\n${el}`,
      '<!channel> The following PRs have no been reviewed:'
    );

    const data = {
      channel: config.codeReviewTeamChannelId,
      text: textMessage,
    };

    await rtm.sendToChat(data);
  } catch (error) {
    console.error('RTM error', error);
  }
};

const notifyMentorAboutExpiredTask = async (mentorChannelId, message) => {
  const data = {
    channel: mentorChannelId,
    text: message,
  };

  await rtm.sendToChat(data, 'student');
};

const notifyManagersAboutExpiredTask = async (message) => {
  const data = {
    channel: config.internManagerChannelId,
    text: `<!channel>, ${message}`,
  };

  await rtm.sendToChat(data, 'student');
};

module.exports = {
  notifyAboutNewRequestOrExtra,
  notifyUserAboutHisRequest,
  notifyAdminAboutExpiredRequest,
  notifyAdminAboutBirthday,
  sendAdInGeneral,
  notifyTeamAboutUnreviewedPRs,
  notifyMentorAboutExpiredTask,
  notifyManagersAboutExpiredTask,
};
