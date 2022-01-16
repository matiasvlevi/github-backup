const config = require('dotenv').config().parsed;

const { Octokit } = require("@octokit/core");
const octokit = new Octokit({ auth: config.TOKEN });

const { existsSync } = require('fs');
const { exec } = require('child_process');
const util = require('util');
const exec_ = util.promisify(exec);

const os = require('os');

const delay = time => new Promise(res => setTimeout(res, time));

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
  console.log(` Starting download`);
  console.log(` User: ${config.USER}`);
  console.log(` Repositories found:  ${res.data.length}\n\n`);

  // Clone all of em.
  let i = 0;
  for (let repo of res.data) {
    let name = repo.name;
    if (existsSync(`./${name}`)) {
      console.log(' Repo allready exists');
    } else {
      await exec_(
        `git clone https://github.com/${repo.full_name}.git`
      );
      console.log(
        ` Download ${p(i/res.data.length)}% \x1b[32m${repo.full_name}\x1b[0m`
      );
      await delay(500);
    }
    i++;
  }

  // Clean all non-backup related files
  let cmd = (os.platform() === 'win32') ? 'start' : 'source';
  let ext = (os.platform() === 'win32') ? 'bat' : 'sh';
  await exec_(`${cmd} clean.${ext}`);
});