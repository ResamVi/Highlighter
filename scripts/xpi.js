/* eslint-disable no-undef */
/* eslint-disable no-console  */
const { version } = require('../package.json');

const archiver = require('archiver');

const fs = require('fs');

var output = fs.createWriteStream(`highlighter-${version}.xpi`);
var archive = archiver('zip');

output.on('close', () => {
    console.log(`${archive.pointer()} total bytes`);
    console.log(`File 'highlighter-${version}.xpi' created`);
});

archive.on('error', (err) => {
    throw err;
});

archive.on('warning', (err) => {
    throw err;
});

archive.pipe(output);

// append files from a sub-directory, putting its contents at the root of archive
archive.directory('dist/', false);

archive.finalize();
