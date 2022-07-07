const { dirArray, convertAll } = require("./src/convert.js");
const { cleanUp } = require("./src/util.js");

for (var i = 0; i < process.argv.length; i++) {
    switch (process.argv[i]) {
        case 'convert':
            convertAll();
            break;
        case 'clean':
            cleanUp(dirArray);
            break;
    }
}