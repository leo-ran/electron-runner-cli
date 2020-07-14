import ora from "ora";
import path from "path";
import webpack from "webpack";
import {ChildProcessWithoutNullStreams, spawn} from "child_process";
import webpackHotMiddleware from "webpack-hot-middleware";
import WebpackDevServer from "webpack-dev-server";
import {mainConfig} from "./main-config";
import {rendererConfig} from "./renderer-config";
import logger from "./lib/logger";

let mainProcess: ChildProcessWithoutNullStreams | null;
let electronRestart: boolean = false;

const spinner = ora('开始编译... \n').start();
const electron = require("electron");

/**
 * 运行主进程代码编译
 */
function runMainBundle(): Promise<any> {
    return new Promise((r, j) => {
        const compiler = webpack(mainConfig);
        compiler.watch({}, (err, stats) => {
            if (err) throw err;
            spinner.succeed('主进程编译开始...');
            // 只输出错误信息
            if (stats.hasErrors()) {
                console.log(stats.toString({
                    chunks: false,
                    colors:true,
                }));
            }
            if (mainProcess && mainProcess.kill){

                // 主进程设置为热重启状态
                electronRestart = true;

                // 监听主进程关闭事件
                mainProcess.on('close',() => {
                    // 设置主进程为非热重启状态
                    electronRestart = false;
                })
                // 杀死electron进程
                process.kill(mainProcess.pid);
                // 清空进程
                mainProcess = null;

                // 重启Electron
                startElectron()
            }
        });
        compiler.hooks.done.tap("ElectronMainDone", () => r());
        compiler.hooks.failed.tap("ElectronMainFailed", () => j());
    })
}

/**
 * 运行UI进程编译
 */
function runRendererBundle(): Promise<any> {
    const entry = rendererConfig.entry;
    if (Array.isArray(entry)) {
        rendererConfig.entry = [
            "webpack-hot-middleware/client?path=/__what&timeout=2000&overlay=false",
            ...entry,
        ];
    }
    return new Promise((r, j) => {
        const compiler = webpack(rendererConfig);
        const server = new WebpackDevServer(compiler, {
            ...rendererConfig.devServer,
            before (app) {
                app.use(webpackHotMiddleware(compiler,{
                    log: false,
                    path: "/__what",
                    heartbeat: 2000
                }));
                spinner.succeed("web进程已启动");
                r();
            }
        });
        server.listen(rendererConfig.devServer ? rendererConfig.devServer.port || 9080 : 9080);
        compiler.hooks.failed.tap("ElectronRendererError",() => j());
    });
}

/**
 * 启动Electron进程
 */
function startElectron(){
    spinner.succeed("启动Electron进程中...")
    mainProcess = spawn(electron,[path.resolve("dist","main.js")])
    mainProcess.stdout.on('data',data=>{
        let text = ''
        data = data.toString().split(/\r?\n/)
        data.map((line: string) => {
            text += `${line}\n`
        })
        if (/[0-9A-z]+/.test(text)){
            logger.info(text)
        }
    })

    mainProcess.stderr.on('data', data => {
        let text=''
        data = data.toString().split(/\r?\n/)
        data.map((line: string) => {
            text += `${line}\n`
        })
        if (/[0-9A-z]+/.test(text)){
            logger.error(text)
        }
    })

    mainProcess.on('close', () => {
        if(!electronRestart) process.exit()
    })

    spinner.succeed("Electron进程已启动!")
}

export function start(): void {
     Promise.all([
        runMainBundle(),
        runRendererBundle(),
    ]).then(() => {
         startElectron();
    }).catch(err => {
         console.log(err);
     });
}
