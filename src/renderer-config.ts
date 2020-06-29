import {Configuration, RuleSetUseItem} from "webpack";
import {Configuration as DevServerConfiguration} from "webpack-dev-server";
import * as path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import OptimizeCssAssetsPlugin from "optimize-css-assets-webpack-plugin";
import * as webpack from "webpack";

const isProduction = process.env.NODE_ENV === 'production';
const buildType = (process.env.NODE_ENV_TYPE || "web") as  "web" | "electron-renderer";
const cwd = process.cwd();
const sourcePath = path.join(cwd, "src", "renderer");
const styleLoader = (isModule: boolean = false): RuleSetUseItem[] => {
  return [
    ...(isProduction ? [
      MiniCssExtractPlugin.loader,
    ] : []),
    {
      loader: "style-loader",
    },
    {
      loader: "css-loader",
      options: {
        sourceMap: false,
        modules: isModule,
        import: isModule,
      }
    }
  ];
};
const lessLoaderOption: RuleSetUseItem = {
  loader: "less-loader",
  options: {
    sourceMap: false,
  }
}
const sassLoaderOption: RuleSetUseItem = {
  loader: "sass-loader",
  options: {
    implementation: require('sass'),
    sourceMap: false,
  }
}
const devServerOption: DevServerConfiguration = {
  compress: true,
  port: 9080,
  stats: {
    colors: true,
    chunks: false,
    assets: true,
    modules: false
  },
}

export const rendererConfig: Configuration = {
  mode: isProduction ? "production" : "development",
  entry: [path.join(sourcePath, "index.ts")],
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".node"]
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: styleLoader()
      },
      {
        test: /\.module.css$/,
        use: styleLoader(true)
      },
      {
        test: /\.less$/,
        use: [
          ...styleLoader(),
          lessLoaderOption,
        ]
      },
      {
        test: /\.module.less$/,
        use: [
          ...styleLoader(true),
          lessLoaderOption,
        ]
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          ...styleLoader(),
          sassLoaderOption,
        ]
      },
      {
        test: /\.module.s[ac]ss$/i,
        use: [
          ...styleLoader(true),
          sassLoaderOption,
        ]
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          "ts-loader",
        ]
      },
      {
        test: /\.m?jsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: {
          loader: 'file-loader',
          options: {
            limit: 10000,
            name: isProduction ? 'images/[name].[ext]' : 'images/[name].[hash:7].[ext]'
          }
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        use: {
          loader: 'file-loader',
          options: {
            limit: 10000,
            name: isProduction ? 'medias/[name].[ext]' : 'medias/[name].[hash:7].[ext]'
          }
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: {
          loader: 'file-loader',
          options: {
            limit: 10000,
            name: isProduction ? 'fonts/[name].[ext]' : 'fonts/[name].[hash:7].[ext]',
          }
        }
      }
    ],
  },
  output: {
    path: path.join(cwd, "dist", "renderer"),
    filename: `[name].js`,
    libraryTarget: 'umd'
  },
  plugins: [
    new webpack.ProgressPlugin(),
    // https://github.com/jantimon/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve('public', 'index.html'),
      minify: isProduction,
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
  optimization: {
    minimize: isProduction,
    splitChunks: isProduction ? {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all"
        }
      }
    } : false
  },
  target: buildType,
  devServer: devServerOption,
};

if (isProduction && rendererConfig.plugins) {
  rendererConfig.plugins.push(
    // https://github.com/webpack-contrib/mini-css-extract-plugin
    new MiniCssExtractPlugin({
      filename: "styles/[name].css"
    }),
    // https://github.com/NMFR/optimize-css-assets-webpack-plugin
    new OptimizeCssAssetsPlugin({})
  )
}
