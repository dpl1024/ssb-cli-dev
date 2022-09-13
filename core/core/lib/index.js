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
    log.verbose('debug', 'test debug log');
  } catch (e) {
    log.error(e.message);
  }
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
  console.log(userHome);
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
