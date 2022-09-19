const { isObject } = require('@ssb-cli-dev/utils');

class Package {
  constructor(options) {
    console.log('Package constructor');
    if (!options) {
      throw new Error('Package类的options参数不能为空');
    }
    if (!isObject(options)) {
      throw new Error('Package类的options参数必须为对象');
    }
    const {
      targetPath, // package的路径
      storePath, // package的存储路径
      packageName, // package的name
      packageVersion, // package的版本
    } = options;
    this.targetPath = targetPath;
    this.storePath = storePath;
    this.packageName = packageName;
    this.packageVersion = packageVersion;
  }

  exists() {

  }

  install() {

  }

  update() {

  }

  getRootFilePath() {

  }
}

module.exports = Package;
