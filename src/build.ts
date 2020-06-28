import ora from "ora";
import webpack from "webpack";
import {mainConfig} from "./main-config";
import {rendererConfig} from "./renderer-config";


const spinner = ora('开始编译... \n').start();

/**
 * 运行主进程代码编译
 */
function buildMainBundle(): Promise<any> {
    spinner.succeed("开始编译主进程");
    return new Promise((r, j) => {
        const compiler  = webpack(mainConfig);
        compiler.hooks.done.tap("ElectronMainDone", () => {
            r();
            spinner.succeed("主进程编译完成");
        });
        compiler.hooks.failed.tap("ElectronMainFailed", (params) => {
            j();
            spinner.fail("主进程编译失败");
            console.log(params);
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
        compiler.hooks.done.tap("ElectronRendererDone", () => {
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
    return Promise.all([
         buildMainBundle(),
         buildRendererBundle(),
    ]);
}
