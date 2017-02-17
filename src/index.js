'use strict';

const co = require('co');
const init = require('./lib/init');

const wrapByCO = function(fn) {
  return function() {
    const args = [].slice.call(arguments);
    return co(fn.apply(null, args));
  };
};

exports.init = wrapByCO(init);
