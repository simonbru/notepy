const path = require("path");

const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");

module.exports = (env, argv) => {
  const baseName = argv.hot ? "[name]" : "[name].[chunkhash:4]";

  return {
    entry: {
      common: "./app/js/common.js",
      login: "./app/js/login.js",
      note_edit: "./app/js/note_edit.js",
      todo_edit: "./app/js/todo_edit.js",
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "babel-loader",
        },
        {
          test: /\.(css|scss)$/,
          use: [
            // Extracts CSS into separate files
            MiniCssExtractPlugin.loader,
            // Translates CSS into CommonJS
            "css-loader",
            // Compile SCSS into CSS
            {
              loader: "sass-loader",
              options: {
                sassOptions: {
                  includePaths: [
                    path.resolve(
                      __dirname,
                      "node_modules/bootstrap-sass/assets/stylesheets"
                    ),
                  ],
                },
              },
            },
          ],
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          use: ["file-loader"],
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          use: ["file-loader"],
        },
      ],
    },
    output: {
      path: path.resolve(__dirname, "app/static/dist"),
      publicPath: "/static/dist/",
      filename: `${baseName}.chunk.js`,
    },
    devServer: {
      port: 3080,
      // Set --hot from CLI so that we can set `baseName` conditionally
      // hot: true,
      writeToDisk: (filePath) => filePath.endsWith("/manifest.json"),
      overlay: {
        errors: true,
      },
      proxy: {
        "/": {
          target: process.env.PROXY_TARGET_URL || "http://localhost:8080",
        },
      },
    },
    devtool: "source-map",
    optimization: {
      minimizer: ["...", new CssMinimizerPlugin()],
      splitChunks: {
        chunks: "all",
      },
    },
    plugins: [
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
      }),
      new MiniCssExtractPlugin({
        filename: `${baseName}.chunk.css`,
      }),
      new WebpackManifestPlugin({
        generate: (seed, files) => filesByEntrypoint(files),
      }),
    ],
    devtool: "source-map",
  };
};

function filesByEntrypoint(files) {
  const result = {};
  files
    .filter((file) => file.chunk)
    .forEach((file) => {
      const chunkEntries =
        file.chunk.runtime instanceof Set
          ? file.chunk.runtime
          : [file.chunk.runtime];
      chunkEntries.forEach((entry) => {
        if (!result[entry]) {
          result[entry] = [];
        }
        result[entry].push(file.path);
      });
    });
  return result;
}
