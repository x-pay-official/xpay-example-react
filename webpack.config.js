const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');
const fs = require('fs');

// Get the root path (assuming your webpack config is in the root of your project)
const currentPath = path.join(__dirname);

// Create the fallback path (the production .env)
const basePath = currentPath + '/.env';

// We're concatenating the environment name to our filename to specify the correct env file!
const envPath = basePath;

// Check if the file exists, otherwise fall back to the production .env
const finalPath = fs.existsSync(envPath) ? envPath : basePath;

// Set the path parameter in the dotenv config
const fileEnv = dotenv.config({ path: finalPath }).parsed;

// Create an object from the current env file for the DefinePlugin
const envKeys = fileEnv
  ? Object.keys(fileEnv).reduce((prev, next) => {
      prev[`process.env.${next}`] = JSON.stringify(fileEnv[next]);
      return prev;
    }, {})
  : { 'process.env.REACT_APP_XPAY_BASE_URL': JSON.stringify('https://api.x-pay.fun') };

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
      vm: false
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    }),
    new webpack.DefinePlugin({
      ...envKeys,
      'process.env': JSON.stringify(process.env),
      'process.browser': true,
      'process.version': JSON.stringify(process.version)
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser'
    })
  ],
  devServer: {
    historyApiFallback: true,
    port: 3000,
    open: true
  }
};
