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
    checkGlobalUpdate();
  } catch (e) {
    log.error(e.message);
  }
}

async function checkGlobalUpdate() {
  /**
   * 1.获取最新版本号和模块名后
   * 2.调用npm api，获取所有版本号
   * 3.提取所有版本号，对比版本号是否大于当前版本号
   * 4.获取最新版本号，提示用户更新
   */
  const currentVersion = pkg.version;
  const npmName = pkg.name;
  const { getNpmSemverVersions } = require('@ssb-cli-dev/get-npm-info');
  const latestVersion = await getNpmSemverVersions(currentVersion, npmName);
  if (latestVersion && semver.gt(latestVersion, currentVersion)) {
    log.warn('更新提示', colors.yellow(`请手动更新 ${npmName}, 当前版本: ${currentVersion}, 最新版本: ${latestVersion}, 更新命令: npm install -g ${npmName}`));
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
