const delay = time => new Promise(res => setTimeout(res, time));
const { existsSync } = require('fs');
const os = require('os');

const { exec } = require('child_process');
const util = require('util');
const exec_ = util.promisify(exec);

const config = require('dotenv').config().parsed;

const { Octokit } = require("@octokit/core");
const octokit = new Octokit({ auth: config.TOKEN });

let dev = (process.argv[2] || '') === 'dev';

// Percent string
const p = (x) => {
  let s = `${Math.round(x*100)}`
  if (s.length <= 1) s = ` ${s}`;
  return s;
}

octokit.request(`GET /users/{name}/repos`, {
  name: config.USER,
  type: "private",
  per_page: '100'
}).then(async(res) => {
  console.log(`\n` +
    `Github Backup\n` +
    `User: \x1b[32m${config.USER}\x1b[0m\n` +
    `Repositories found: \x1b[32m${res.data.length}\x1b[0m\n`
  );

  // Clone all of em.
  let i = 0;
  for (let repo of res.data) {
    let name = repo.name;
    let cname = `\x1b[32m${repo.full_name}\x1b[0m`;
    let percent = `${p(i/res.data.length)}%`
    if (existsSync(`./${name}`)) {
      console.log(`\x1b[33mExisting\x1b[0m ${percent} ${cname}`);
    } else {
      // Clone
      let url = `https://github.com/${repo.full_name}.git ./${config.USER}/${name}`;
      if (!dev) await exec_(`git clone ${url}`);

      // Log
      console.log(`\x1b[32mCloned\x1b[0m   ${percent} ${cname}`);
      await delay(500);
    }
    i++;
  }

  // Clean all non-backup related files
  let cmd = (os.platform() === 'win32') ? 'start' : 'source';
  let ext = (os.platform() === 'win32') ? 'bat' : 'sh';
  if (!dev) await exec_(`${cmd} clean.${ext}`);
});