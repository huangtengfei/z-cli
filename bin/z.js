#!/usr/bin/env node

'use strict';

const path = require('path');
const program = require('commander');
const co = require('co');
const chalk = require('chalk');

const runCmd = function(cmd) {

  const filepath = path.join(__dirname, `../src/cmd/${cmd}`);
  const cmder = require(filepath);
  const args = [].slice.call(arguments, 1);
  args.unshift(process.cwd());

  co(function* () {
    try {
      if (cmder.constructor.name === 'GeneratorFunction') {
        yield* cmder.apply(null, args);
      } else {
        cmder.apply(null, args);
      }
    } catch (e) {
      console.log(chalk.red(e.stack) || e.message);
    }
  });
};

program
  .version('0.1.0')
  .usage('[command] [options]');

program
  .command('init')
  .description('初始化应用')
  .action(() => {
    runCmd('init');
  });

program
  .command('build')
  .description('打包编译静态资源')
  .option('-e --externals', '将 React、ReactDOM 添加到 externals 属性')
  .option('-p --polyfill', '是否打包 babel-polyfill')
  .option('-s --source-map [sourceMap]', '生成 source map 文件')
  .option('-u --uglify', '压缩代码')
  .action(options => {
    runCmd('build', options);
  });

program
  .command('watch')
  .description('启动静态资源服务器并实时编译')
  .option('-e --externals', '将 React、ReactDOM 添加到 externals 属性')
  .option('-p --polyfill', '是否打包 babel-polyfill')
  .option('-s --source-map [sourceMap]', '生成 source map 文件')
  .option('-u --uglify', '压缩代码')
  .option('-p --port [port]', '指定静态服务监听的端口号', 8080)
  .action(options => {
    runCmd('watch', options);
  });

program.parse(process.argv);
