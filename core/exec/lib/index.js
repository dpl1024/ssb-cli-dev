const Package = require('@ssb-cli-dev/package');
const log = require('@ssb-cli-dev/log');

const SETTINGS = {
  init: '@ssb-cli-dev/init',
};

function exec() {
  const targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  log.verbose('targetPath', targetPath);
  log.verbose('homePath', homePath);
  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj._name;
  const packageName = SETTINGS[cmdName];
  const packageVersion = 'latest';

  const pkg = new Package({
    targetPath,
    storePath: homePath,
    packageName,
    packageVersion,
  });
  console.log(pkg);
}

module.exports = exec;
