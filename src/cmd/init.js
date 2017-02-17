'use strict';

const inquirer = require('inquirer');
const path = require('path');
const init = require('../lib/init');

module.exports = function* (dir) {
  const questions = [
    {
      type: 'input',
      name: 'name',
      message: '应用名',
      default: path.basename(dir)
    },
    {
      type: 'input',
      name: 'description',
      message: '应用描述'
    },
    {
      type: 'input',
      name: 'author',
      message: '作者'
    },
    {
      type: 'input',
      name: 'template',
      message: '模板地址'
    }
  ];

  const params = yield inquirer.prompt(questions);
  yield* init(dir, params);

};
