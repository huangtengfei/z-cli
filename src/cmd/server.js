'use strict';

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const getConfig = require('../config/webpack');

module.exports = function(cwd) {
  console.log('start server...');
  const config = getConfig(cwd, true);
  const compiler = webpack(config);
  const server = new WebpackDevServer(compiler, {
    hot: true,
    stats: {
      chunks: false,
      children: false,
      colors: true
    },
    publicPath: '/static/'
  });
  server.listen(8080);
};
