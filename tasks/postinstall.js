const fs = require('fs');


// Symlink source folder into node_modules to allow for absolute imports
const target = '../app';
const symlink = 'node_modules/app';
fs.lstat(symlink, (e, stats) => {
  if (e) {
    fs.symlink(target, symlink, 'dir', (err) => { if (err) { console.log(err); } });
  } else if (!stats.isSymbolicLink()) {
    console.log('WARNING: node_modules/app exists but is not a symlink.');
  }
});


// Rebuild native app modules to match electron version
const electron = require('electron-prebuilt');
const electronPackage = require('electron-prebuilt/package.json');
const rebuild = require('electron-rebuild');
const path = require('path');

const pathToElectronNativeModules = path.join(__dirname, '../app/node_modules');

rebuild.shouldRebuildNativeModules(electron)
  .then((shouldBuild) => {
    if (!shouldBuild) {
      return console.log('Node versions match, skipping rebuild.');
    }

    console.log('Rebuilding native modules for Electron...');

    return rebuild.installNodeHeaders(electronPackage.version)
      .then(() => rebuild.rebuildNativeModules(
        electronPackage.version, pathToElectronNativeModules))
      .then(() => console.log('Rebuilding complete.'));
  })
  .catch((err) => console.error('Rebuilding error!', err));
