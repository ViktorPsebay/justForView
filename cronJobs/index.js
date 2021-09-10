/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const { CronJob } = require('cron');
const jobs = require('require-dir')();

const cronWorker = () => {
  Object.keys(jobs).forEach((jobsName) => {
    try {
      const { default: cronJobCallback, cronExpression } = require(`./${jobsName}`);

      if (!cronJobCallback || !cronExpression) {
        throw (new Error('Require jobs return undefined'));
      }

      const croneWork = new CronJob(cronExpression, cronJobCallback, null, false, null, null, true);
      croneWork.start();
      console.log(`Cron job '${cronJobCallback.name}' with '${cronExpression}' is started`);
    } catch (error) {
      console.warn(`Error starting cronJobs: ${error.message}`);
    }
  });
};

module.exports = cronWorker;
