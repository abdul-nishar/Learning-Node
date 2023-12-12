const path = require('path');
// const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  target: 'web',
  // mode: 'development',
  mode: 'production',
  entry: ['@babel/polyfill', path.resolve(__dirname, 'public/js/index.js')],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public/js'),
  },
  // devtool: 'inline-source-map',
  devtool: 'source-map',

  // // plugins: [
  //   new HtmlWebpackPlugin({
  //     template: path.join(__dirname, 'views/base.pug'),
  //   }),
  // ],
  // module: {
  //   rules: [
  //     {
  //       test: /\.js$/,
  //       exclude: /node_modules/,
  //       use: {
  //         loader: 'babel-loader',
  //       },
  //     },
  //     {
  //       test: /\.pug$/,
  //       use: {
  //         loader: 'simple-pug-loader',
  //       },
  //     },
  //     { test: /\.css$/, use: 'css-loader' },
  //     { test: /\.file$/, use: 'file-loader' },
  //     { test: /\.webfont$/, use: 'webfont-loader' },
  //   ],
  // },
};
