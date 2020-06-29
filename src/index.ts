#!/usr/bin/env node

import program from "commander";
import chalk from "chalk";
import ora from "ora";
import download from "download-git-repo";
import path from "path";
import inquirer from "inquirer";

const cwd = process.cwd();
const VERSION = require("../package").version;
const repo = "leo-ran/electron-template";
const { spawn } = require("child_process")

program.version(VERSION,"-v, --version");

program
  .command("create <project-name>")
  .description("使用模板创建一个新项目")
  .action(async (projectName: string) => {
    let template: string = "javascript";
    let installType: "npm" | "yarn" = "npm";
    const {isTypescript} = await inquirer.prompt<{isTypescript: boolean}>({
      type: "confirm",
      name: "isTypescript",
      message:  "是否使用typescript?",
      default: true,
    });

    if (isTypescript) {
      template = "typescript";
    }

    const {isInstall} = await inquirer.prompt<{isInstall: boolean}>({
      type: "confirm",
      name: "isInstall",
      message:"是否自动安装依赖?",
      default:true
    });

    if (isInstall) {
        const {select} = await inquirer.prompt<{select: string}>({
          type: "list",
          message: "选择安装工具",
          choices: [
            "使用yarn安装",
            "使用npm安装"
          ],
          default: 0,
          name: "select"
        });

        if (select === "使用yarn安装") {
          installType = "yarn";
        } else if (select === "使用npm安装") {
          installType = "npm";
        }
    }

    const spinner = ora("开始下载模板文件").start();
    download(`${repo}#react-${template}`, path.join(cwd, projectName), (err) => {
      if(err){
        spinner.fail(`模板下载失败，或不存在模板${template}！`);
        throw err;
      }

      spinner.succeed('模板下载成功！');
      if (isInstall && installType) {
        const installSpinner = ora("开始安装依赖").start();
        install(installType, projectName).then(() => {
          installSpinner.succeed("安装完毕！")
        }).catch(() => {
          installSpinner.fail("安装失败，请重试！")
        })
      }
    })
  })

program
  .command("start")
  .description("使用开发环境启动项目")
  .action(() => {
    process.env.NODE_ENV = "development";
    const {start} = require("./start");
    start();
  });

program
  .command("build")
  .description("编译生产项目")
  .action(async () => {
    process.env.NODE_ENV = "production";
      const {build} = require("./build");
     await build();
     // 启动electronBuild编译
     spawn(require("electron-builder"));
  });

program
  .command("rebuild")
  .description("重新编译c++ 模块")
  .action(() => {
      // 重新编译
      spawn(require("electron-rebuild"));
  })

program.parse(process.argv);

if(process.argv.length <= 2){
  program.outputHelp(cb=>{
    return chalk.green(cb)
  })
}


/**
 * 安装依赖
 * @param type
 */
function install(type: "npm" | "yarn", projectName: string): Promise<void> {
  return new Promise((r, j)=> {
    if(process.platform == 'win32') type += '.cmd';

    const npmi = spawn(type,['install'],{
      cwd: path.resolve(projectName),
      stdio: "inherit",
      env: process.env
    })

    npmi.on('close',() => {
      r();
      console.log('\nTo get started:\n')
      console.log(chalk.yellow(`cd ${projectName}`))
      console.log(chalk.yellow(`${type.replace('.cmd','')} start`))
    })

    npmi.on("error", (err: Error) => {
      j(err)
    })
  })
}
