const isWin = (require('os').platform() === 'win32');
const { existsSync, unlinkSync } = require('fs');

const util = require('util');
const delay = util.promisify(setTimeout);
const exec = util.promisify(
  require('child_process').exec
);

async function clean() {
  unlinkSync('./README.md');
  unlinkSync('./.gitignore');
  unlinkSync('./.gitattributes');
  unlinkSync('./.env');
  unlinkSync('./package.json');
  unlinkSync('./package-lock.json');
  // Self
  let cmd = isWin ? 'call' : 'source';
  let ext = isWin ? 'bat' : 'sh';
  await exec(`${cmd} clean.${ext}`);
}

const config = require('dotenv').config().parsed;

const { Octokit } = require("@octokit/core");
const octokit = new Octokit({ auth: config.TOKEN });

let dev = (process.argv[2] || '') === 'dev';

// Percent string
const p = (x) => {
  let s = `${Math.round(x*100)}`
  return (s.length <= 1) ? s = ` ${s}` : s;
}

octokit.request(`GET /users/{name}/repos`, {
  name: config.USER,
  type: "private",
  per_page: '5'
}).then(async(res) => {
  let len = res.data.length;
  console.log(`\n` +
    `Github Backup\n` +
    `User: \x1b[32m${config.USER}\x1b[0m\n` +
    `Repositories found: \x1b[32m${len}\x1b[0m\n`
  );

  // Clone all of em.
  let i = 0;
  for (let repo of res.data) {
    let cname = `\x1b[32m${repo.full_name}\x1b[0m`;
    let percent = `${p(i/len)}%`

    if (existsSync(`./${repo.name}`)) {
      console.log(`\x1b[33mExisting\x1b[0m ${percent} ${cname}`);
    } else {
      // Clone
      let url = `https://github.com/${repo.full_name}.git`;
      if (!dev) await exec(`git clone ${url}`);

      // Log
      console.log(`\x1b[32mCloned\x1b[0m   ${percent} ${cname}`);
      await delay(500);
    }
    i++;
  }

  // Clean all non-backup related files
  if (!dev) clean();
});