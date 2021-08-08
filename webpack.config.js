const path = require('path');
module.exports = {
  mode: 'production',
  entry: 'liquimodel.js',
  output: {
    filename: 'liquimodel.js',
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /(node_modules)/,
        use: 'babel-loader',
      }
    ],
  },
  resolve: {
    alias: {
      'react': path.resolve(__dirname, './node_modules/react'),
      'lodash': path.resolve(__dirname, './node_modules/lodash')
    }
  },
  externals: {
    react: {
      commonjs: "react",
      commonjs2: "react",
      amd: "React",
      root: "React"
    },
    lodash: {
      commonjs: 'lodash',
      amd: 'lodash',
      root: '_'
    }
  }
};