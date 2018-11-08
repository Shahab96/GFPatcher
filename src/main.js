const md5 = require('md5-file/promise');
const moment = require('moment');
const fs = require('fs');
const archiver = require('archiver');
const path = require('path');
const reference = require('./reference.json');

const gameDirectory = 'C:\\AeriaGames\\Grand Fantasia\\';
const hashFile = (filename) => md5.sync(filename);
const walk = (directory) => {
  const list = fs.readdirSync(directory);
  list.forEach((file) => {
    const dir = path.join(directory, file);
    const stats = fs.statSync(dir);
    if (stats.isFile()) {
      hashes.push({
        File: dir,
        Date: moment().format('MM-DD-YYYY').toString(),
        Hash: hashFile(dir),
      });
    } else if (stats.isDirectory()) {
      walk(dir);
    }
  });
};

const hashes = [];
const diff = [];

walk(gameDirectory);

hashes.forEach((hash) => {
  const thisFile = reference.find(file => file.File === hash.File);
  const hashMoment = moment(hash.Date, 'MM-DD-YYYY');
  const referenceMoment = moment(thisFile.Date, 'MM-DD-YYYY');
  if (hash.Hash !== thisFile.Hash && hashMoment.isSameOrAfter(referenceMoment)) {
    diff.push(hash.File);
    hash.Hash = md5.sync(hash.File);
  }
});

const output = fs.createWriteStream(`./patch_${moment().format('MM-DD-YYYY').toString()}.zip`);
const archive = archiver('zip', {
  zlib: {
    level: 9,
  },
});

archive.pipe(output);

diff.forEach(file => archive.file(file));

archive.finalize();
