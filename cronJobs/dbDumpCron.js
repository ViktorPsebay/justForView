const fs = require('fs');
const child_process = require('child_process');
const moment = require('moment');
const path = require('path');
const { startsWith } = require('lodash/string');
const { transporter } = require('../transporter');
const config = require('../../config');

const {
  dbConfig: {
    username,
    dbName,
    password,
    host,
  },
} = require('../../config');

exports.default = async function makePostgresDump() {
  try {
    const getCommitHashString = 'log --name-status HEAD^..HEAD';
    const getCommitHashExec = await child_process.spawnSync('git', getCommitHashString.split(' '));
    const responseString = getCommitHashExec.stdout.toString();
    const responseLines = responseString.split(/(\r?\n)/g);
    const commitLine = responseLines.find(el => startsWith(el, 'commit'));

    const commitNumber = commitLine.split(' ')[1];
    const shortNumber = commitNumber && typeof commitNumber === 'string' ? commitNumber.slice(0, 8) : '';
    const filename = `dump_${dbName}_${moment().format('DD_MM_YYYY')}_${shortNumber}.sql`;
    const filePath = path.resolve(`./${filename}`);
    const dumpCommand = `pg_dump postgres://${username}:${password}@${host}:5432/${dbName} -n public > ${filename}`;

    await child_process.execSync(dumpCommand);

    const mailOptions = {
      from: config.serviceEmail,
      to: config.serviceEmail,
      subject: `Database dump: ${filename}`,
      attachments: [
        {
          filename,
          path: filePath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    fs.unlinkSync(filePath);
  } catch (err) {
    console.error('@@@Cron "makePostgresDump" error: ', err);
  }
};

module.exports.cronExpression = '0 2 */2 * *';
