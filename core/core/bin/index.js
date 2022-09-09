#!/usr/bin/env node

const importLocal = require('import-local');
const npmLog = require('npmlog');

if (importLocal(__filename)) {
  npmLog.info('cli', '正在使用 ssb-cli-dev 本地版本');
} else {
  require('../lib')(process.argv.slice(2));
}
