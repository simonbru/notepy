const path = require('path');

const ManifestPlugin = require('webpack-manifest-plugin');

module.exports = {
  resolve: {
    alias: {
      'react': 'preact-compat',
      'react-dom': 'preact-compat',
    }
  },
  entry: {
    note_edit: './app/js/note_edit.js',
    todo_edit: './app/js/todo_edit.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, 'app/static/dist'),
    filename: '[name].[chunkhash:4].bundle.js'
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  plugins: [
    new ManifestPlugin(),
  ],
  devtool: 'source-map',
};
