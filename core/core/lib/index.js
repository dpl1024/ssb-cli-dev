/**
 * require支持加载的文件类型
 * .js module.exports/exports
 * .json JSON.parse
 * .node process.dlopen
 * 其他 按照 .js 文件解析
 */

const npmlog = require('@ssb-cli-dev/log');
const init = require('@ssb-cli-dev/init');
const exec = require('@ssb-cli-dev/exec');
const userHome = require('user-home');
const pathExistsSync = require('path-exists').sync;
const semver = require('semver');
const colors = require('colors/safe');
const path = require('path');
const commander = require('commander');
const { getNpmSemverVersions } = require('@ssb-cli-dev/get-npm-info');
const dotenv = require('dotenv');
const rootCheck = require('root-check');
const pkg = require('../package.json');
const constant = require('./const');

const program = new commander.Command();

async function core() {
  try {
    await prepare();
    registerCommand();
  } catch (e) {
    npmlog.error(e.message);
  }
}

async function prepare() {
  checkPkgVersion();
  checkNodeVersion();
  checkRoot();
  checkUserHome();
  checkEnv();
  await checkGlobalUpdate();
}

function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d --debug', '是否开启调试模式', false)
    .option('-tp, --targetPath <targetPath>', '是否指定本地调试文件路径', '');

  const opts = program.opts();

  program
    .on('option:debug', () => {
      if (opts.debug) {
        process.env.LOG_LEVEL = 'verbose';
      } else {
        process.env.LOG_LEVEL = 'info';
      }
      npmlog.level = process.env.LOG_LEVEL;
    });

  program.on('option:targetPath', () => {
    process.env.CLI_TARGET_PATH = opts.targetPath;
  });

  program
    .on('command:*', (obj) => {
      const availableCommands = program.commands.map((cmd) => cmd.name());
      console.log(colors.red(`未知命令：${obj[0]}`));
      if (availableCommands.length > 0) {
        console.log(colors.red(`可用命令：${availableCommands.join(',')}`));
      }
    });

  program
    .command('init [project-name]')
    .option('-f, --force', '是否强制初始化项目')
    .action(exec);

  if (program.args.length < 1) {
    program.outputHelp();
  }

  program
    .parse(process.argv);
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
  const latestVersion = await getNpmSemverVersions(currentVersion, npmName);
  if (latestVersion && semver.gt(latestVersion, currentVersion)) {
    npmlog.warn('更新提示', colors.yellow(`请手动更新 ${npmName}, 当前版本: ${currentVersion}, 最新版本: ${latestVersion}, 更新命令: npm install -g ${npmName}`));
  }
}

function checkEnv() {
  const envPath = path.resolve(userHome, '.env');
  if (pathExistsSync(envPath)) {
    dotenv.config({
      path: envPath,
    });
  }
  createDefaultConfig();
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

function checkUserHome() {
  if (!userHome || !pathExistsSync(userHome)) {
    throw new Error(colors.red('当前登录用户主目录不存在！'));
  }
}

function checkRoot() {
  // process.geteuid()
  // 0 root
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
  npmlog.info('cli', pkg.version);
}

module.exports = core;
