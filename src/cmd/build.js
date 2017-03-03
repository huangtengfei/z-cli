'use strict';

const fs = require('fs-extra-promise');
const path = require('path');
const webpack = require('webpack');
const getConfig = require('../config/webpack');

module.exports = function* (cwd, opts) {
  console.log('start building...');
  yield fs.removeAsync(path.join(cwd, './static'));
  const config = getConfig(cwd, false, opts);
  webpack(config, function(err, stats) {
    if (err) {
      console.log('webpack:build', err);
      process.exit(1);
    }
    console.log('[webpack:build]', stats.toString({
      chunks: false, // Makes the build much quieter
      colors: true,
      children: false
    }));
  });
};
