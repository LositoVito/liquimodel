const path = require('path');
var webpack = require('webpack');
module.exports = {
  mode: 'production',
  entry: './src/liquimodel.js',
  output: {
    path: path.resolve('lib'),
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
  plugins: [
      new webpack.ProvidePlugin({
          "_": "lodash"
      })
  ],
  externals: {
    react: {
      commonjs: "react",
      commonjs2: "react",
      amd: "React",
      root: "React"
    },
    lodash: {
      commonjs: 'lodash',
      commonjs2: 'lodash',
      amd: 'lodash',
      root: '_'
    }
  }
};