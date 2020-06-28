import chalk from "chalk";


export function log(type: string, content: string) {
    console.log(`┏—${type}—————————————————————`);
    console.log(`\n`);
    console.log(` ${content}`);
    console.log(`\n`);
    console.log(`┗————————————————————————`);
}

export function error(text: string){
    const type = chalk.redBright('Error');
    log(type,text);
}

export function success(text: string){
    const type = chalk.greenBright('Success');
    log(type,text);
}

export function warn(text: string){
    const type = chalk.yellowBright('Warn');
    log(type,text);
}

export function info(text: string){
    const type = chalk.blueBright('Info');
    log(type,text);
}


export default {
    error,
    success,
    warn,
    info,
    log,
}