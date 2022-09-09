module.exports = core;

/**
 * require支持加载的文件类型
 * .js module.exports/exports
 * .json JSON.parse
 * .node process.dlopen
 * 其他 按照 .js 文件解析
 */

const log = require('@ssb-cli-dev/log');
const pkg = require('../package.json');

function core() {
  checkPkgVersion();
}

function checkPkgVersion() {
  log.info('cli', pkg.version);
}
