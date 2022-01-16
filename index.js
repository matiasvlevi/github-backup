const { Octokit } = require("@octokit/core");
const util = require('util');
const { exec } = require('child_process');
const exec_ = util.promisify(exec);
const delay = time => new Promise(res => setTimeout(res, time));
const config = require('dotenv').config().parsed;

const octokit = new Octokit({ auth: config.TOKEN });
console.log(config.USER)

octokit.request(`GET /users/{name}/repos`, {
  name: 'matiasvlevi',
  type: "all",
}).then(async(res) => {

  // Clone all of em.
  for (let repo of res.data) {
    let name = repo.full_name;
    let cmd = `git clone https://github.com/${name}.git`;
    await exec_(cmd);
    console.log(`Downloaded ${name}`);
    await delay(1000);
  }

});