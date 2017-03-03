'use strcit';

const fs = require('fs');
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

module.exports = function(dir, isServer, options) {
  let config = {
    output: {
      path: path.join(dir, 'static'),
      publicPath: `http://localhost:${options.port}/static/`,  // cdn 替换参考 webpack output.publicPath 官方文档
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

  // 为命令的布尔型参数提供初始值
  const initialOpts = ['externals', 'polyfill', 'uglify'];
  initialOpts.forEach(opt => {
    if (typeof options[opt] !== 'boolean') {
      options[opt] = false;
    }
  });

  // 如果没有设置 process.env.NODE_ENV 就根据是否压缩来设置
  if (!process.env.NODE_ENV) {
    if (options.uglify) {
      process.env.NODE_ENV = 'production';
    } else {
      process.env.NODE_ENV = 'development';
    }
  }

  // 如果提供了 -s 参数但没有指定值，就设置 sourceMap 为 source-map，否则用指定的 string 值
  if (typeof options.sourceMap === 'boolean') {
    config.devtool = 'source-map';
  } else if (options.sourceMap) {
    config.devtool = options.sourceMap;
  }

  // 不打包 react、react-dom ，减小打包体积
  if (options.externals) {
    /* eslint-disable */
    config.externals = {
      'react': 'var window.React',
      'react-dom': 'var window.ReactDOM',
      'react/lib/ReactTransitionGroup': 'var window.React.addons.TransitionGroup',
      'react/lib/ReactCSSTransitionGroup': 'var window.React.addons.CSSTransitionGroup'
    };
    /* eslint-enable */
  }

  // 压缩代码
  if (options.uglify) {
    config.plugins.push(
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: false,
        compress: {
          warnings: false
        }
      })
    );
  }

  // 通过设置环境变量压缩 react 代码
  config.plugins.push(
    new webpack.DefinePlugin({
      process: {
        env: {
          NODE_ENV: JSON.stringify(process.env.NODE_ENV)
        }
      }
    })
  );

  const pkg = require(path.join(dir, 'package.json'));
  const entry = pkg.entry;
  config.entry = isServer ? getServerEntry(entry, options.port) : entry;
  config = customizeConfig(dir, config);

  // 将 babel-polyfill 打包进去，提供 regeneratorRuntime
  if (options.polyfill) {
    const entry = config.entry;
    Object.keys(entry).forEach(key => {
      let value = entry[key];
      value = Array.isArray(value) ? value : [value];
      if (value.indexOf('babel-polyfill') === -1) {
        entry[key] = [require.resolve('babel-polyfill')].concat(value);
      }
    });
  }
  
  return config;
};

/**
 * 修改 entry，加入 webpack dev server 的 HMR 和 Auto Refresh 功能
 */
function getServerEntry(entry, port) {
  if (entry && typeof entry === 'object' && Object.keys(entry).length) {
    return Object.keys(entry).reduce((ret, key) => {
      let value = entry[key];
      if (!Array.isArray(value)) {
        value = [value];
      }
      value.push(
        `${require.resolve('webpack-dev-server/client/')}?http://localhost:${port}/`,
        require.resolve('webpack/hot/dev-server')
      );
      ret[key] = value;
      return ret;
    }, {});
  } else {
    throw new Error('entry必须为非空对象');
  }
}

/**
 * 合并自定义的 webpack 配置文件，示例：
 * module.exports = function(config) {
 *   // add some loader or plugin
 * return config;
 * }
 */
function customizeConfig(dir, config) {
  const customPath = path.join(dir, 'webpack.config.js');
  if (fs.existsSync(customPath)) {
    config = require(customPath)(config);
  }
  return config;
}
