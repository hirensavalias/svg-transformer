
const fsExtra = require("fs-extra");

const cleanUp = (dirArr) => {
    dirArr.forEach(dir => {
        fsExtra.emptyDirSync(dir);
    })
}

module.exports = cleanUp

