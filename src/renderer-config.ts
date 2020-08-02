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
                {
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                        publicPath: '../../'
                    }
                },
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
        // Cancel default require sass.
        // implementation: require('sass'),
        sourceMap: false,
    }
}

const tsLoaderOption: RuleSetUseItem = {
    loader: "ts-loader",
    options: {}
}

const devServerOption: DevServerConfiguration = {
    compress: true,
    port: 9080,
    stats: isProduction ? "normal" : "errors-warnings",
}

let config: Configuration = {
    mode: isProduction ? "production" : "development",
    entry: [sourcePath],
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: [".ts", ".tsx", ".js", ".jsx", ".vue", ".json", ".node"]
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
                use: isProduction ? {
                    loader: "file-loader",
                    options: {
                        limit: 10000,
                        name: "assets/images/[name].[ext]",
                        esModule: false,
                    }
                }: {
                    loader: "url-loader",
                    options: {
                        esModule: false,
                    }
                }
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                use: isProduction ? {
                    loader: "file-loader",
                    options: {
                        limit: 10000,
                        name: "assets/medias/[name].[ext]",
                        esModule: false,
                    }
                }: {
                    loader: "url-loader",
                    options: {
                        esModule: false,
                    }
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                use: isProduction ? {
                    loader: "file-loader",
                    options: {
                        limit: 10000,
                        name: "assets/fonts/[name].[ext]",
                        esModule: false,
                    }
                }: {
                    loader: "url-loader",
                    options: {
                        esModule: false,
                    }
                }
            }
        ],
    },
    output: {
        path: path.join(cwd, "dist", "application", "renderer"),
        filename: `assets/js/[name].js`,
        libraryTarget: 'umd',
        publicPath: isProduction ? "./" : "/"
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
                    filename: "assets/styles/[name].css",
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
            },
        } : false
    },
    target: "electron-renderer",
    stats: isProduction ? "normal" : "errors-warnings",
    devServer: devServerOption,
};

function createLessConfig(lessLoaderOption: RuleSetUseItem) {
    return [
        {
            test: /\.less$/,
            use: [
                ...styleLoader(),
                lessLoaderOption
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
function createTsConfig(...tsLoaderOptions: RuleSetUseItem[]) {
    return {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [...tsLoaderOptions]
    };
}

const restConfigFilePath = path.resolve("electron.config.js");

// less设置
let lessConfig: RuleSetUseItem = lessLoaderOption;
// sass设置
let sassConfig: RuleSetUseItem = sassLoaderOption;
// ts设置
let tsConfigs: RuleSetUseItem[] = [
    tsLoaderOption
];

if (fs.existsSync(restConfigFilePath)) {
    const _config: ElectronRunnerConfig = require(restConfigFilePath);
    if (typeof _config === "object") {
        if (typeof _config.less === "function") {
            lessConfig = _config.less(lessLoaderOption)
        }

        if (typeof _config.sass === "function") {
            sassConfig = _config.sass(sassLoaderOption)
        }


        if (typeof _config.ts === "function") {
            tsConfigs = _config.ts(tsLoaderOption);
        }

        // 开发服务器
        if (_config.devServer) {
            config.devServer = {
                ...config.devServer,
                ..._config.devServer,
            }
        }

        // 重写loaders
        if (typeof _config.overwriteLoaders === "function") {
            config.module = config.module || {rules: []};
            config.module.rules = _config.overwriteLoaders(config.module?.rules || [])
        }

        // 重写 plugins
        if (typeof _config.overwritePlugins === "function") {
            config.plugins = _config.overwritePlugins(config.plugins || [])
        }

        if (_config.webpack) {
            config = merge(config, _config.webpack);
        }
    }
}

config.module?.rules.push(...createLessConfig(lessConfig));
config.module?.rules.push(...createSassConfig(sassConfig));
config.module?.rules.push(createTsConfig(...tsConfigs));

export const rendererConfig = config;
