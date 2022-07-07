
const fsExtra = require("fs-extra");

const cleanUp = (dirArr) => {
    dirArr.forEach(dir => {
        fsExtra.emptyDirSync(dir);
    })
}

const createDirs = (dirArr) => {
    dirArr.forEach(dir => {
        fsExtra.mkdirSync(dir);
    })
}

module.exports = { cleanUp, createDirs }

