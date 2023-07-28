#!/usr/bin/env node

'use strict';

var chokidar = require('chokidar');
var path = require('path');
var rimraf = require('rimraf');
var fs = require('fs-extra');
var chalk = require('chalk');
var tnCapitalize = require('tn-capitalize');

const dirtree = (folder, ignored = []) => {
    return fs.readdirSync(folder, { withFileTypes: true })
        .map((ff) => {
        const fullpath = path.join(folder, ff.name);
        if (ignored.includes(fullpath))
            return;
        if (ff.isFile())
            return fullpath;
        return [fullpath, ...dirtree(fullpath, ignored)];
    })
        .flat()
        .filter((i) => i)
        .sort((a, b) => a.length - b.length);
};

const execWatch = (event, frompath, topath) => {
    setTimeout(() => {
        if (event === 'addDir')
            return fs.ensureDirSync(topath);
        if (event === 'unlink' || event === 'unlinkDir')
            return rimraf(topath, () => null);
        if (event === 'add' || event === 'change') {
            fs.copyFileSync(frompath, topath);
            fs.chmodSync(topath, 0o444);
        }
    }, 100);
};

const getConfigs = async () => {
    const configpath = path.join(process.cwd(), 'copycat.configs.json');
    if (!fs.existsSync(configpath)) {
        return console.log(chalk.bgRed.whiteBright(' ERROR '), chalk.visible('Could not find'), chalk.yellow.bold.italic('copycat.configs.json'), chalk.visible('file into the'), chalk.cyan.bold.italic('root'), chalk.visible('folder\n'));
    }
    let config;
    try {
        config = fs.readJSONSync(configpath);
    }
    catch {
        return console.log(chalk.bgRed.whiteBright(' ERROR '), chalk.visible('Invalid config file'), chalk.red.bold.italic('backup.configs.json\n'));
    }
    return config;
};

const negetypes = ['unlinkDir', 'unlink', 'clean'];
let processid = 0;
const logger = (idx, event, relpath) => {
    const etype = tnCapitalize.capitalize(event).replace(':', '');
    relpath = relpath.replaceAll('\\', '/') || '.';
    const negtype = negetypes.includes(event);
    const bgcolor = negtype ? 'bgRedBright' : 'bgGreenBright';
    const color = negtype ? 'redBright' : 'greenBright';
    const gap = ' '.repeat(Math.max(9 - etype.length, 0));
    console.log(chalk.bgGray(` ${idx} `) + chalk[bgcolor].black(` ${etype} `), gap + chalk.yellow.bold(`${++processid}`), chalk[color](relpath));
};

console.clear();
run();
async function run() {
    const configs = await getConfigs();
    if (!configs)
        return;
    configs.forEach((config, idx) => {
        const copyfrom = path.join(process.cwd(), config.copyfrom);
        const copyto = path.join(process.cwd(), config.copyto);
        const ignored = config.excludes.map((p) => path.join(copyfrom, p));
        fs.ensureDirSync(copyto);
        const has = dirtree(copyto).map((p) => path.relative(copyto, p));
        const mayhave = dirtree(copyfrom, ignored).map((p) => path.relative(copyfrom, p));
        const orphaned = has.filter((p) => !mayhave.includes(p));
        orphaned.forEach((path$1) => {
            logger(idx, 'unlink', path$1);
            rimraf(path.join(copyto, path$1), () => null);
        });
        chokidar.watch(copyfrom, { ignored }).on('all', (event, frompath) => {
            const relpath = path.relative(copyfrom, frompath);
            const topath = path.join(copyto, relpath);
            logger(idx, event, relpath);
            execWatch(event, frompath, topath);
        });
    });
}
