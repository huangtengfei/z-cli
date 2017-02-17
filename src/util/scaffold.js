'use strict';

const os = require('os');
const path = require('path');
const fs = require('fs-extra-promise');
const chalk = require('chalk');
const utils = require('../util/utils');

/**
 * 生成应用骨架
 * @param {String} dir 输出目录
 * @param {String} template 种子模板 git 地址
 * @param {Object} 模板中需要替换掉的字符串和对应的值
 */

module.exports = function* (dir, template, params) {
  const tmpdir = path.join(os.tmpdir(), `z-temp-${Date.now()}`);
  yield fs.mkdirAsync(tmpdir);
  try {
    const pkgDir = yield* downloadTemplate(template, tmpdir);
    yield* writeFile(pkgDir, dir, params);
    console.log(chalk.green('初始化成功!'));
  } finally {
    yield fs.removeAsync(tmpdir);
  }
};

// 下载模板
function* downloadTemplate(template, tmpdir) {
  const cmd = `git clone ${template} template`;
  yield utils.exec(cmd, {
    cwd: tmpdir
  });
  return path.join(tmpdir, 'template', 'content');
}

// 写入文件，递归替换掉模板中的参数
function* writeFile(src, dest, params) {
  const names = yield fs.readdirAsync(src);
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const srcFile = path.join(src, name);
    const destFile = path.join(dest, utils.replaceParams(name, params));
    const stat = yield fs.statAsync(srcFile);
    if (stat.isDirectory()) {
      if (!(yield fs.existsAsync(destFile))) {
        yield fs.mkdirAsync(destFile);
      }
      yield writeFile(srcFile, destFile, params);
    } else {
      const content = yield fs.readFileAsync(srcFile, 'utf8');
      yield fs.writeFileAsync(destFile, utils.replaceParams(content, params));
    }
  }
}
