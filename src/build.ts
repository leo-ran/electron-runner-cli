import ora from "ora";
import webpack from "webpack";
import {mainConfig} from "./main-config";
import {rendererConfig} from "./renderer-config";
import fs from "fs";

const spinner = ora('开始编译... \n').start();


/**
 * 运行主进程代码编译
 */
function buildMainBundle(): Promise<any> {
    spinner.succeed("开始编译主进程");
    return new Promise((r, j) => {
        const compiler = webpack(mainConfig);
        compiler.run((err, stats) => {
            if (err) {
                j(err);
            }
            if (stats.hasErrors()) {
                console.log(stats.toString())
            }
        });
        compiler.hooks.afterEmit.tap("ElectronMainDone", () => {
            spinner.succeed("主进程编译完成");
            r();
        });
        compiler.hooks.failed.tap("ElectronMainFailed", (params) => {
            spinner.fail("主进程编译失败");
            console.log(params);
            j();
        });
    })
}

/**
 * 运行UI进程编译
 */
function buildRendererBundle(): Promise<any> {
    spinner.succeed("开始编译渲染进程");
    return new Promise((r, j) => {
        const compiler = webpack(rendererConfig);
        compiler.run((err, stats) => {
            if (err) {
                j(err);
            }
            if (stats.hasErrors()) {
                console.log(stats.toString())
            }
        });
        compiler.hooks.afterEmit.tap("ElectronRendererDone", () => {
            r();
            spinner.succeed("渲染进程编译完成");
        });
        compiler.hooks.failed.tap("ElectronRendererError",(params) => {
            j();
            spinner.fail("渲染进程编译失败");
            console.log(params);
        });
    });
}

export function build(): Promise<any[]> {

    // 清理主进程编译目录
    if (mainConfig.output && mainConfig.output.path) {
        if (fs.existsSync(mainConfig.output.path)) {
            fs.rmdirSync(mainConfig.output.path, {
                recursive: true
            });
        }
    }

    // 清理渲染进程编译目录
    if (rendererConfig.output && rendererConfig.output.path) {
        if (fs.existsSync(rendererConfig.output.path)) {
            fs.rmdirSync(rendererConfig.output.path, {
                recursive: true
            });
        }
    }

    return Promise.all([
         buildMainBundle(),
         buildRendererBundle(),
    ]);
}
