#!/usr/bin/env node
 
'use strict';
 
var program = require('commander');
 
program
  .version('0.1.0')
  .usage('[command] [options]');

program
  .command('init')
  .description('初始化应用')
  .action(() => {
    console.log('init success')
  });

program.parse(process.argv);
