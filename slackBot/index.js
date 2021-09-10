const { WebClient } = require('@slack/client');
const config = require('../config/index');

class Rtm {
  constructor(token, tokenIntern, botname = 'Fusion Dev Bot') {
    this.botname = botname;

    try {
      this.webClient = new WebClient(token);
      this.webClientIntern = new WebClient(tokenIntern);

      console.log(`Slack is running as ${this.botname}`);
    } catch (err) {
      console.log('error', err);
      this.botname = null;
      this.webClient = null;
      this.webClientIntern = null;
    }
  }

  async sendToChat(data, recipientRole = 'user') {
    const params = {
      type: 'message',
      as_user: false,
      username: this.botname,
      icon_url: config.siteAddress + config.slackBotIconPath,
      ...data,
    };

    try {
      let result;
      if (this.webClient && (recipientRole !== 'student')) {
        result = await this.webClient.chat.postMessage(params);
      }

      if (this.webClientIntern && (recipientRole === 'student')) {
        result = await this.webClientIntern.chat.postMessage(params);
      }

      return result;
    } catch (err) {
      console.log(`${this.botname}:channel ${data.channel} sendToChat error ${err.message}`);
      return null;
    }
  }
}

const rtm = new Rtm(
  config.slackToken,
  config.slackInternalToken,
  config.slackbotUsername
);
module.exports = {
  rtm,
};
