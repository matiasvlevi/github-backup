const isWin = (require('os').platform() === 'win32');
const { existsSync, unlinkSync } = require('fs');

const util = require('util');
const delay = util.promisify(setTimeout);
const exec = util.promisify(
  require('child_process').exec
);

let USER = process.argv[2];
let TOKEN = process.argv[3];
let dev = (process.argv[4] || '') === 'dev';

async function clean() {
  await delay(500);
  unlinkSync('./README.md');
  unlinkSync('./.gitignore');
  unlinkSync('./.gitattributes');
  unlinkSync('./package.json');
  unlinkSync('./package-lock.json');
  // Self
  let cmd = isWin ? 'start' : 'source';
  let ext = isWin ? 'bat' : 'sh';
  await exec(`${cmd} clean.${ext}`);
}

// Percent string
const p = (x) => {
  let s = `${Math.round(x*100)}`
  return (s.length <= 1) ? s = ` ${s}` : s;
}

if (USER !== undefined && TOKEN !== undefined) {

  const { Octokit } = require("@octokit/core");
  const octokit = new Octokit({ auth: TOKEN });

  octokit.request(`GET /users/{name}/repos`, {
    name: USER,
    type: "private",
    per_page: '100'
  }).then(async(res) => {
    let len = res.data.length;
    console.log(`\n` +
      `Github Backup\n` +
      `User: \x1b[32m${USER}\x1b[0m\n` +
      `Repositories found: \x1b[32m${len}\x1b[0m\n`
    );

    // Clone all of em.

    for (let i = 0; i < res.data.length; i++) {
      let repo = res.data[i];
      let cname = `\x1b[32m${repo.full_name}\x1b[0m`;
      let percent = `${p((i+1)/len)}%`

      if (existsSync(`./${repo.name}`)) {
        console.log(`\x1b[33mExisting\x1b[0m ${percent} ${cname}`);
      } else {
        // Clone
        let url = `https://github.com/${repo.full_name}.git`;
        try {
          if (!dev) await exec(`git clone ${url}`);
        } catch (e) {
          console.log('Github API Failed, retrying');
          i--;
        }

        // Log
        console.log(`\x1b[32mCloned\x1b[0m   ${percent} ${cname}`);
        await delay(500);
      }
    }

    // Clean all non-backup related files
    if (!dev) clean();
  });
} else {
  console.log('Token or username were not provided')
}