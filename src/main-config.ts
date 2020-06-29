import {Configuration} from "webpack";
import path from "path";
const isProduction = process.env.NODE_ENV === "production"

const cwd = process.cwd();
const sourcePath = path.join(cwd, "src", "main");

export const mainConfig: Configuration = {
  entry: path.join(sourcePath, "index.ts"),
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
    __dirname: isProduction,
    __filename: isProduction
  },
  resolve: {
    extensions: [".ts", ".json", ".node"]
  },
  target: "electron-main",
  mode: isProduction ? "production" : "development",
}
