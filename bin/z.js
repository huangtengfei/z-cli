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
  .description('构建应用')
  .action(() => {
    runCmd('build');
  });

program
  .command('server')
  .description('启动服务器')
  .action(() => {
    runCmd('server');
  });

program.parse(process.argv);
