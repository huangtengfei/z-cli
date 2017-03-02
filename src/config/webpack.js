'use strcit';

const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const nodeModules = path.join(__dirname, '../../node_modules');

const jsLoader = `babel?${JSON.stringify({
  cacheDirectory: true,
  compact: false,
  presets: [
    'babel-preset-react',
    'babel-preset-es2015',
    'babel-preset-stage-0'
  ].map(require.resolve),
  plugins: [
    'babel-plugin-transform-react-es6-displayname',
    'babel-plugin-transform-decorators-legacy',
    'babel-plugin-add-module-exports',
    'babel-plugin-lodash'
  ].map(require.resolve)
})}`;
const cssLoader = ExtractTextPlugin.extract('css');
const sassLoader = ExtractTextPlugin.extract('css!fast-sass');

module.exports = function(dir, isServer) {
  const config = {
    output: {
      path: path.join(dir, 'build'),
      publicPath: '/static/',
      filename: '[name].js'
    },
    resolve: {
      extensions: ['', '.js', '.jsx'],
      modulesDirectories: ['node_modules']
    },
    resolveLoader: {
      root: [nodeModules]
    },
    module: {
      loaders: [{
        test: /\.jsx?$/,
        loader: jsLoader
      }, {
        test: /\.css$/,
        loader: cssLoader
      }, {
        test: /\.scss$/,
        loader: sassLoader
      }]
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new ExtractTextPlugin('[name].css')
    ]
  };

  const pkg = require(path.join(dir, 'package.json'));
  const entry = pkg.entry;
  config.entry = isServer ? getServerEntry(entry) : entry;
  return config;
};

function getServerEntry(entry) {
  if (entry && typeof entry === 'object' && Object.keys(entry).length) {
    return Object.keys(entry).reduce((ret, key) => {
      let value = entry[key];
      if (!Array.isArray(value)) {
        value = [value];
      }
      value.push(
        require.resolve("webpack-dev-server/client/") + '?http://localhost:8080/',
        require.resolve("webpack/hot/dev-server")
      );
      ret[key] = value;
      return ret;
    }, {});
  } else {
    throw new Error('entry必须为非空对象');
  }
}
