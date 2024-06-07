/* eslint-disable no-undef */
/* eslint-disable no-console  */
const { version } = require('../package.json');

const archiver = require('archiver');

const { execSync } = require('child_process');
const fs = require('fs');

// 1. Remove old stuff
fs.rmSync('dist/', { recursive: true, force: true });

// 2. Build dist folder
execSync("npm run build");

// 3. Bundle dist folder into xpi
var output = fs.createWriteStream(`highlighter-${version}.xpi`);
var archive = archiver('zip');

output.on('close', () => {
    console.log(`${archive.pointer()} total bytes`);
    console.log(`File 'highlighter-${version}.xpi' created`);
});

archive.on('warning', (err) => {
    throw err;
});

archive.on('error', (err) => {
    throw err;
});


archive.pipe(output);
archive.directory('dist/', false);
archive.finalize();
