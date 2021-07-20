const fs = require("fs");
const path = require("path");
const compressing = require('compressing');

async function wait(time) {
    return new Promise(resolve => {
        setTimeout(resolve, time)
    })
}

function isInstalled(packageName) {
    try {
        require.resolve(packageName);

        return true;
    } catch (err) {
        return false;
    }
};

function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}

function createFile(dir, name, data) {
    mkdirsSync(dir);
    if (typeof data !== "string") {
        data = JSON.stringify(data);
    }

    if (fs.existsSync(path.join(dir, name))) {
        fs.unlink(path.join(dir, name), function (err) {
            fs.writeFileSync(path.join(dir, name), data, {})
        });
    } else {
        fs.writeFileSync(path.join(dir, name), data, {})
    }
}

function copyFile(target, destination, ignore) {
    let stat = fs.statSync(target);
    let isFile = stat.isFile();
    let shouldSkip = ignore.includes(path.parse(target).name);

    if (shouldSkip) {
        return true;
    }

    if (isFile) {
        fs.copyFileSync(target, destination);
    } else {
        mkdirsSync(destination);
        let files = fs.readdirSync(target);
        files.forEach(fileName => {
            let unitTargetPath = path.join(target, fileName);
            let unitDestPath = path.join(destination, fileName);
            copyFile(unitTargetPath, unitDestPath, ignore);
        })
    }
}

function deleteFolder(folder){
    let files = [];
    if(fs.existsSync(folder)){
      if(fs.statSync(folder).isFile()){
        fs.unlinkSync(folder)
        return;
      }
      files = fs.readdirSync(folder);
      files.forEach(function(item){
        const cur = folder + "/" + item;
        if(fs.statSync(cur).isDirectory()){
          deleteFolder(cur)
        }else{
          fs.unlinkSync(cur)
        }
      })
      fs.rmdirSync(folder)
    }
  }

function compress(folder){
    return new Promise((resolve,reject) => {
      compressing.zip.compressDir(folder, folder+'.zip')
      .then(() => {
        resolve('ok');
      })
      .catch(err => {
          reject(err);
          return
      });
    })
}

module.exports = {
    wait,
    isInstalled,
    mkdirsSync,
    createFile,
    copyFile,
    compress,
    deleteFolder
}