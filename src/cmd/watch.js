'use strict';

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const chalk = require('chalk');
const getConfig = require('../config/webpack');

module.exports = function(cwd, opts) {
  console.log('start server and watching...');
  const config = getConfig(cwd, true, opts);
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
  server.listen(opts.port, () => {
    console.log(chalk.green(`server run at http://localhost:${opts.port}`));
  });
};
