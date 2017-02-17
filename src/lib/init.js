'use strict';

const generateScaffold = require('../util/scaffold');

module.exports = function* (dir, params) {
  try {
    yield* generateScaffold(dir, params.template, params);
  } catch (e) {
    throw new Error(e.error);
  }
};
