import {Configuration} from "webpack";
import path from "path";
const isProduction = process.env.NODE_ENV === "production"

const cwd = process.cwd();
const sourcePath = path.join(cwd, "src", "main");

export const mainConfig: Configuration = {
  entry: sourcePath,
  output:{
    filename:  "[name].js",
    libraryTarget: "commonjs2",
    path: path.join(cwd, "dist", "main")
  },
  module:{
    rules:[
      {
        test:/\.ts$/,
        exclude:/node_modules/,
        use: "ts-loader"
      }
    ]
  },
  node: {
    __dirname: !isProduction,
    __filename: !isProduction
  },
  resolve: {
    extensions: [".ts",  ".js",".json", ".node"]
  },
  target: "electron-main",
  stats: isProduction ? "normal" : "errors-warnings",
  mode: isProduction ? "production" : "development",
}
