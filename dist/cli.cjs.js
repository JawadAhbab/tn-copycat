'use strict';

var chokidar = require('chokidar');
var fs = require('fs-extra');
var path = require('path');
var rimraf = require('rimraf');
var chalk = require('chalk');
var tnCapitalize = require('tn-capitalize');

const execWatch = (event, frompath, topath, readonly) => {
    setTimeout(() => {
        if (event === 'addDir')
            return;
        if (event === 'unlink' || event === 'unlinkDir')
            return rimraf(topath, () => null);
        if (event === 'add' || event === 'change') {
            try {
                if (fs.existsSync(topath))
                    fs.chmodSync(topath, 0o666);
                fs.ensureDirSync(path.dirname(topath));
                fs.copyFileSync(frompath, topath);
                fs.chmodSync(topath, readonly ? 0o444 : 0o666);
            }
            catch { }
        }
    }, 100);
};

const isExcluded = (path, { excludes, includes }) => {
    const exc = excludes.some((i) => path.startsWith(i));
    const inc = includes.some((i) => path.startsWith(i));
    return exc && !inc;
};

const filetree = (folder, excludes = [], includes = []) => {
    return fs.readdirSync(folder, { withFileTypes: true })
        .map((ff) => {
        const fullpath = path.join(folder, ff.name);
        const path$1 = isExcluded(fullpath, { excludes, includes }) ? null : fullpath;
        if (ff.isFile())
            return path$1;
        return filetree(fullpath, excludes, includes);
    })
        .flat()
        .filter((i) => i)
        .sort((a, b) => a.length - b.length);
};

const getBlankFolders = (folder) => {
    const blanks = [];
    function isEmpty(dir) {
        const items = fs.readdirSync(dir);
        if (items.length === 0)
            return true;
        return items.every((item) => {
            const itemPath = path.join(dir, item);
            return fs.statSync(itemPath).isDirectory() && isEmpty(itemPath);
        });
    }
    function traverse(dir) {
        if (isEmpty(dir)) {
            blanks.push(dir);
            return true;
        }
        const items = fs.readdirSync(dir);
        items.forEach((item) => {
            const itemPath = path.join(dir, item);
            if (fs.statSync(itemPath).isDirectory())
                traverse(itemPath);
        });
        return false;
    }
    traverse(folder);
    return blanks;
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

const rimrafAsync = (path) => {
    return new Promise((resolve) => {
        rimraf(path, () => resolve(true));
    });
};

console.clear();
run();
async function run() {
    const configs = await getConfigs();
    if (!configs)
        return;
    configs.forEach(async (config, idx) => {
        const copyfrom = path.join(process.cwd(), config.copyfrom);
        const copyto = path.join(process.cwd(), config.copyto);
        const excludes = config.excludes?.map((p) => path.join(copyfrom, p)) || [];
        const includes = config.includes?.map((p) => path.join(copyfrom, p)) || [];
        fs.ensureDirSync(copyto);
        const has = filetree(copyto).map((p) => path.relative(copyto, p));
        const mayhave = filetree(copyfrom, excludes, includes).map((p) => path.relative(copyfrom, p));
        const orphaned = has.filter((p) => !mayhave.includes(p));
        for (const path$1 of orphaned) {
            logger(idx, 'unlink', path$1);
            await rimrafAsync(path.join(copyto, path$1));
        }
        const blanks = getBlankFolders(copyto);
        blanks.forEach((blank) => rimrafAsync(blank));
        chokidar.watch(copyfrom).on('all', (event, frompath) => {
            const relpath = path.relative(copyfrom, frompath);
            const topath = path.join(copyto, relpath);
            if (isExcluded(frompath, { excludes, includes }))
                return;
            logger(idx, event, relpath);
            execWatch(event, frompath, topath, config.readonly);
        });
    });
}
