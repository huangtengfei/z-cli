#!/usr/bin/env node

'use strict';

const program = require('commander');
const co = require('co');
const chalk = require('chalk');
const init = require('../src/cmd/init');

const runCmd = function() {

  const cwd = process.cwd();

  co(function* () {
    try {
      yield* init(cwd);
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
    runCmd();
  });

program.parse(process.argv);
