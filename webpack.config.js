const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './index.web.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(tsx?|jsx?|js)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react', '@babel/preset-typescript'],
            plugins: ['react-native-web']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js'],
    alias: {
      'react-native$': 'react-native-web',
      'react-native-gesture-handler': path.resolve(__dirname, './src/mocks/gesture-handler.web.js'),
      'react-native-reanimated': path.resolve(__dirname, './src/mocks/reanimated.web.js'),
      '@react-native-async-storage/async-storage': path.resolve(__dirname, './src/mocks/async-storage.web.js'),
      'react-native-screens': path.resolve(__dirname, './src/mocks/screens.web.js'),
      'react-native-safe-area-context': path.resolve(__dirname, './src/mocks/safe-area.web.js'),
      './pdfService': './pdfService.web',
      './App': './App.web'
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public/manifest.json', to: 'manifest.json' },
        { from: 'public/service-worker.js', to: 'service-worker.js' },
        { from: 'public/register-sw.js', to: 'register-sw.js' },
        { from: 'public/icons', to: 'icons', noErrorOnMissing: true }
      ]
    })
  ],
  devServer: {
    port: 3001,
    hot: true,
    open: false,
    historyApiFallback: true,
    client: {
      overlay: false,
      logging: 'warn'
    }
  }
};