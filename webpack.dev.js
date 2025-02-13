const path = require('path');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');


module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'src', 'index.js'),
  output: {
    publicPath: '/',
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 3000,
    hot: true,
    open: true,
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
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
      // manifest: 'src/manifest.json',
      cache: true,
      inject: htmlPlugin => {
        return true
      },
      favicons: {
        background: '#fff',
        theme_color: '#fff',
        start_url: '../../',
        appleStatusBarStyle: 'default',
        icons: {
          "android": [
            "android-chrome-192x192.png",
            "android-chrome-48x48.png",
            "android-chrome-512x512.png",
            "android-chrome-96x96.png"
          ],
          "appleIcon": [
            "apple-touch-icon-180x180.png",
            "apple-touch-icon-precomposed.png",
            "apple-touch-icon.png",
          ],
          "appleStartup": false,
          "favicons": [
            "favicon-16x16.png",
            "favicon-32x32.png",
            "favicon.ico",
          ],
          "windows": false,
          "yandex": false,
          coast: false,
          firefox: false,
        },
      },
    }),
  ]
};