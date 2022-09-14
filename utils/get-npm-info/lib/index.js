const semver = require('semver');
const urlJoin = require('url-join');
const axios = require('axios');

function getDefaultRegistry(isOriginal = false) {
  return isOriginal ? 'https://registry.npmjs.org' : 'https://registry.npm.taobao.org';
}

async function getNpmInfo(npmName, registry) {
  if (!npmName) {
    return null;
  }

  const reg = registry || getDefaultRegistry(true);
  const npmInfoUrl = urlJoin(reg, npmName);
  return axios.get(npmInfoUrl)
    .then((res) => {
      if (res.status === 200) {
        return res.data;
      }
      return null;
    })
    .catch((e) => Promise.reject(e));
}

async function getNpmVersions(npmName, registry) {
  const npmData = await getNpmInfo(npmName, registry);
  if (npmData) {
    return Object.keys(npmData.versions);
  }
  return [];
}

function getSemverVersions(baseVersion, versions) {
  return versions
    .filter((v) => semver.satisfies(v, `^${baseVersion}`))
    .sort((a, b) => (semver.gt(b, a) ? 1 : -1));
}

async function getNpmSemverVersions(baseVersion, npmName, registry) {
  const versions = await getNpmVersions(npmName, registry);
  const newVersions = getSemverVersions(baseVersion, versions);
  if (newVersions && newVersions.length > 0) {
    return newVersions[0];
  }
}

module.exports = {
  getNpmInfo,
  getNpmVersions,
  getSemverVersions,
  getNpmSemverVersions,
};
