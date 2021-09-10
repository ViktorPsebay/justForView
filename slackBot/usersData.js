const db = require('../models/index');
const { rtm } = require('./index');

const { Op } = db.Sequelize;

async function updateUserConversationId(req, role, recipientLogin, slack_name, preventThrow) {
  const slackName = slack_name || req.body.slack_name;
  const login = recipientLogin || req.userData.login;

  try {
    let usersList = null;
    if (role !== 'student') {
      usersList = await rtm.webClient.apiCall('users.list');
    } else {
      usersList = await rtm.webClientIntern.apiCall('users.list');
    }

    let userId = null;
    for (let i = 0; i < usersList.members.length; i += 1) {
      const member = usersList.members[i];
      if (member.profile && member.profile.display_name === slackName) {
        userId = member.id;
        break;
      }
    }

    await updateUser(userId, role, login, slackName);
  } catch (error) {
    console.error('updateUserConversationId', error.message);
    // for action adminChange skip throw error
    if (!preventThrow) {
      throw error;
    }
  }
}

async function updateAllUsersConversationId() {
  const options = {
    where: {
      slack_name: { [Op.ne]: null },
    },
    attributes: {
      exclude: ['password', 'createdAt', 'updatedAt'],
    },
  };

  try {
    const allUserInDb = await db.user.findAll(options);

    if (!allUserInDb.length) {
      throw new Error('No users found with slack_name');
    }

    const usersList = await rtm.webClient.apiCall('users.list');

    for (const user of allUserInDb) {
      let userId = null;

      for (let i = 0; i < usersList.members.length; i += i) {
        const member = usersList.members[i];
        if (member.profile && member.profile.display_name === user.slack_name) {
          userId = member.id;
          break;
        }
      }

      await updateUser(userId, user.login, user.slack_name);
    }
  } catch (error) {
    console.error(error.message);
    return false;
  }
  return true;
}

async function updateUser(userId, role = 'user', login, slack_name) {
  if (!userId) {
    await db.user.update(
      {
        slack_conversational_id: null,
        slack_name: null,
      },
      {
        where: { login },
      }
    );
    throw new Error(`Slack name ${slack_name} not found in Slack`);
  }
  let result = null;

  if (role !== 'student') {
    result = await rtm.webClient.apiCall('conversations.open', { users: userId });
  } else {
    result = await rtm.webClientIntern.apiCall('conversations.open', { users: userId });
  }

  if (result && result.ok) {
    const slack_conversational_id = result.channel.id;

    await db.user.update(
      {
        slack_conversational_id,
        slack_name,
      },
      {
        where: { login },
      }
    );
    console.log(
      `The slack_conversational for ${userId} ${slack_name} was updated: ${slack_conversational_id}`
    );
    return;
  }
  throw new Error(`Can't load conversationalId for Id: ${userId}`);
}

module.exports = {
  updateUserConversationId,
  updateAllUsersConversationId,
};
