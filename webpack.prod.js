const path = require('path');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, 'src', 'index.js'),
  output: {
    publicPath: './',
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js' // Добавляет хэш, чтобы браузер обновлял файлы
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'] // Используем MiniCssExtractPlugin для CSS
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(ttf|woff|woff2|eot|otf)$/,
        type: 'asset/resource',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      }
    ]
  },
  plugins: [
    new Dotenv(),
    new HtmlWebpackPlugin({
      favicon: './src/assets/img/finland-flag-icon.svg',
      template: './src/index.html',
    }),
    new FaviconsWebpackPlugin({
      logo: 'src/assets/img/finland-flag-icon.svg',
      mode: 'webapp',
      devMode: 'webapp',
      prefix: 'assets/favicons/',
    }),
    new MiniCssExtractPlugin({
      filename: 'styles.[contenthash].css'
    })
  ]
};