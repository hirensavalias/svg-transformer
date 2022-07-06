const { convert, dirArray } = require("./convert.js");
const { cleanUp } = require("./util.js");

for (var i = 0; i < process.argv.length; i++) {
    switch (process.argv[i]) {
        case 'convert':
            convert();
            break;
        case 'clean':
            cleanUp(dirArray);
            break;
    }
}