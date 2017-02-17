'use strict';

const cp = require('child_process');

/**
 * 工具库
 */
module.exports = {
  // 创建子进程执行命令
  exec(cmd, opts) {
    return new Promise((resolve, reject) => {
      cp.exec(cmd, opts, (error, stdout, stderr) => {
        if (error && stderr) {
          reject(stderr);
        }
        resolve(stdout);
      });
    });
  },
  // 使用参数替换模板中变量
  replaceParams(str, params) {
    const regx = /{([\w\s.()|-]+)}/g;
    return str.replace(regx, (matchStr, matchParam) => {
      return matchParam in params ? params[matchParam] : matchStr;
    });
  }
};
