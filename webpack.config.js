const path = require('path');

const webpack = require('webpack');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const ManifestPlugin = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
  const prodMode = argv.mode === 'production';
  // 'chunkhash' does not work with hot reloading for some reason
  const baseName = argv.inline ? '[name]' : '[name].[chunkhash:4]';

  return {
    entry: {
      common: './app/js/common.js',
      login: './app/js/login.js',
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
        {
          test: /\.(css|scss)$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: !prodMode,
              }
            },
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
              }
            },
            {
              loader: "sass-loader",
              options: {
                includePaths: [
                  path.resolve(__dirname, "node_modules/bootstrap-sass/assets/stylesheets"),
                ],
                sourceMap: true,
              }
            },
          ],
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          use: [
            'file-loader'
          ]
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          use: [
            'file-loader'
          ]
        },
      ],
    },
    output: {
      path: path.resolve(__dirname, 'app/static/dist'),
      publicPath: '/static/dist/',
      filename: `${baseName}.bundle.js`,
    },
    devServer: {
      port: 3080,
      hot: true,
      writeToDisk: filePath => filePath.endsWith('/manifest.json'),
      overlay: {
        errors: true,
      },
      proxy: {
        '/': {
          target: process.env.PROXY_TARGET_URL || 'http://localhost:8080',
        }
      }
    },
    optimization: {
      minimizer: [
        new OptimizeCSSAssetsPlugin({}),
        new TerserPlugin(),  // default webpack JS minimizer
      ],
      splitChunks: {
        chunks: 'all'
      },
    },
    plugins: [
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
      }),
      new MiniCssExtractPlugin({
        filename: `${baseName}.bundle.css`,
      }),
      new ManifestPlugin(),
    ],
    devtool: 'source-map',
  }
};
