module.exports = core;

/**
 * require支持加载的文件类型
 * .js module.exports/exports
 * .json JSON.parse
 * .node process.dlopen
 * 其他 按照 .js 文件解析
 */

const log = require('@ssb-cli-dev/log');
const userHome = require('user-home');
const pathExistsSync = require('path-exists').sync;
const semver = require('semver');
const colors = require('colors/safe');
const path = require('path');
const pkg = require('../package.json');
const constant = require('./const');

let args;

function core() {
  try {
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
    checkInputArgs();
    checkEnv();
  } catch (e) {
    log.error(e.message);
  }
}

function checkEnv() {
  const dotenv = require('dotenv');
  const envPath = path.resolve(userHome, '.env');
  if (pathExistsSync(envPath)) {
    dotenv.config({
      path: envPath,
    });
  }
  createDefaultConfig();
  log.verbose('环境变量', process.env.CLI_HOME_PATH);
}

function createDefaultConfig() {
  const cliConfig = {
    home: userHome,
  };
  if (process.env.CLI_HOME) {
    cliConfig.cliHome = path.join(userHome, process.env.CLI_HOME);
  } else {
    cliConfig.cliHome = path.join(userHome, constant.DEFAULT_CLI_HOME);
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome;
  return cliConfig;
}

function checkInputArgs() {
  const minimist = require('minimist');
  args = minimist(process.argv.slice(2));
  checkArgs();
}

function checkArgs() {
  if (args.debug) {
    process.env.LOG_LEVEL = 'verbose';
  } else {
    process.env.LOG_LEVEL = 'info';
  }
  log.level = process.env.LOG_LEVEL;
}

function checkUserHome() {
  if (!userHome || !pathExistsSync(userHome)) {
    throw new Error(colors.red('当前登录用户主目录不存在！'));
  }
}

function checkRoot() {
  // process.geteuid()
  // 0 root
  const rootCheck = require('root-check');
  rootCheck();
}

function checkNodeVersion() {
  const currentVersion = process.version;
  const lowestVersion = constant.LOWEST_NODE_VERSION;
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(colors.red(`ssb-cli 需要安装 ${lowestVersion} 以上版本的 NodeJS`));
  }
}

function checkPkgVersion() {
  log.info('cli', pkg.version);
}
