const axios = require('axios');
const config = require('../../config');
const { notifyTeamAboutUnreviewedPRs } = require('../../slackBot/messages');

exports.default = async function notifyAboutUnreviewedPRs() {
  const slackAPILink = 'https://slack.com/api/conversations.history';
  try {
    const channelData = await axios.get(slackAPILink, {
      params: {
        token: config.slackToken,
        channel: config.codeReviewChannelId,
        // offset time to exclude initial messages
        oldest: '1559567651.000600',
      },
    });
    if (!channelData.data.ok) {
      console.error('Slack API got error...', channelData.data.error);
      return;
    }
    const { messages } = channelData.data;
    const unreviewedPRs = messages.reduce((accum, el) => {
      // ignore channel join and thread messages
      if (el.subtype === 'channel_join' || el.thread_ts) {
        return accum;
      }
      // collect only messages with reactions
      if (!el.hasOwnProperty('reactions')) {
        accum.push(el.text);
      }
      return accum;
    }, []);
    if (unreviewedPRs.length) {
      await notifyTeamAboutUnreviewedPRs(unreviewedPRs);
    }
  } catch (err) {
    console.error('Slack API got error...', err);
  }
};

// at 11:00 everyday
module.exports.cronExpression = '0 11 * * *';
