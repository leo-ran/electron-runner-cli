import {Configuration, RuleSetUseItem} from "webpack";
import {Configuration as DevServerConfiguration} from "webpack-dev-server";
import * as path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import OptimizeCssAssetsPlugin from "optimize-css-assets-webpack-plugin";
import * as webpack from "webpack";
import merge from "webpack-merge";
import fs from "fs";
import {ElectronRunnerConfig} from "./index";

const isProduction = process.env.NODE_ENV === 'production';
const buildType = (process.env.NODE_RENDERER_TYPE || "web") as "web" | "electron-renderer";
const cwd = process.cwd();
const sourcePath = path.join(cwd, "src", "renderer");
const styleLoader = (isModule: boolean = false) => {
    const cssLoader: any = {
        loader: "css-loader",
        options: {
            sourceMap: false,
            modules: isModule,
            import: isModule,
        }
    }
    if (isModule) {
        cssLoader.options.localIdentName = '[path][name]__[local]--[hash:base64:5]';
        cssLoader.options.camelCase = true;
    }
    return (
        isProduction ?
            [
                MiniCssExtractPlugin.loader,
                cssLoader
            ] :
            [
                "style-loader",
                cssLoader
            ]
    );
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
    stats: isProduction ? "normal" : "errors-warnings",
}

let _rendererConfig: Configuration = {
    mode: isProduction ? "production" : "development",
    entry: [sourcePath],
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
                    loader: "babel-loader",
                    options: {
                        presets: [
                            "@babel/preset-env",
                            "@babel/preset-react"
                        ],
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
    node: {
        __dirname: false,
        __filename: false,
    },
    plugins: [
        // https://github.com/jantimon/html-webpack-plugin
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.resolve('public', 'index.html'),
            minify: isProduction,
        }),
        ...(
            !isProduction ? [
                new webpack.HotModuleReplacementPlugin(),
            ] : [
                // https://github.com/webpack-contrib/mini-css-extract-plugin
                new MiniCssExtractPlugin({
                    filename: "styles/[name].css"
                }),
                // https://github.com/NMFR/optimize-css-assets-webpack-plugin
                new OptimizeCssAssetsPlugin({})
            ]
        )
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
    stats: isProduction ? "normal" : "errors-warnings",
    devServer: devServerOption,
};
const reConfigPath = path.join(cwd, "electron.config.js");

function createLessConfig(lessLoaderOption: RuleSetUseItem) {
    return [
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
    ]
}

function createSassConfig(sassLoaderOption: RuleSetUseItem) {
    return [
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
    ]
}

if (_rendererConfig.module) {
    if (fs.existsSync(reConfigPath)) {
        const config: ElectronRunnerConfig = require(reConfigPath);
        if (typeof config === "object") {
            if (typeof config.less === "function") {
                _rendererConfig.module.rules.push(...createLessConfig(config.less(lessLoaderOption)))
            } else {
                _rendererConfig.module.rules.push(...createLessConfig(lessLoaderOption))
            }

            if (typeof config.sass === "function") {
                _rendererConfig.module.rules.push(...createSassConfig(config.sass(sassLoaderOption)))
            } else {
                _rendererConfig.module.rules.push(...createSassConfig(sassLoaderOption))
            }

            if (config.devServer) {
                _rendererConfig.devServer = {
                    ..._rendererConfig.devServer,
                    ...config.devServer,
                }
            }

            if (config.webpack) {
                _rendererConfig = merge(_rendererConfig, config.webpack)
            }
        } else {
            _rendererConfig.module.rules.push(
                ...createLessConfig(lessLoaderOption),
                ...createSassConfig(sassLoaderOption)
            )
        }
    } else {
        _rendererConfig.module.rules.push(
            ...createLessConfig(lessLoaderOption),
            ...createSassConfig(sassLoaderOption)
        )
    }
}

export const rendererConfig = _rendererConfig;
