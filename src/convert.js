const { scale } = require("scale-that-svg");
const fs = require("fs");
const SVGFixer = require("oslllo-svg-fixer");
const rsp = require("remove-svg-properties-2");
const readSVG = require('simple-svg-tools');
const { cleanUp, createDirs } = require("./util.js");
var argv = require('minimist')(process.argv.slice(2));

const source = "./source";
const tempDir = './temp'
const stage1Dir = `${tempDir}/stage-1`;
const stage2Dir = `${tempDir}/stage-2`;
const outputDir = "./output";

const dirArray = [tempDir, outputDir];
cleanUp(dirArray);
createDirs([stage1Dir, stage2Dir]);

const scaleToPixelsFinal = argv.size || 24;

const convertOne = async function (filename) {
    //read dimensions
    const input = fs.readFileSync(`${source}/${filename}`, 'utf8');
    const svg = new readSVG.SVG(input);
    const max_dimension = Math.max(svg.width, svg.height)

    //remove fill-rule of evenodd
    await SVGFixer(source, stage1Dir).fix();
    const fillRuleRemovedSVG = fs.readFileSync(`${stage1Dir}/${filename}`);

    //scale to given size
    const scaledSVG = await scale(fillRuleRemovedSVG, { scale: (1 / max_dimension) * scaleToPixelsFinal })
    fs.writeFileSync(`${stage2Dir}/${filename}`, scaledSVG);

    //cleaning up svg(remove unnecessory attribites)
    await removeAttributes({
        src: `${stage2Dir}/${filename}`,
        out: outputDir,
        stylesheets: false,
        properties: [rsp.PROPS_STROKE, rsp.PROPS_FILL, 'height', 'width', 'fill-rule', 'color'],
        namespaces: ['i', 'sketch', 'inkscape'],
        log: false
    });

    console.log("\x1b[32m%s\x1b[0m", `${filename} Converted Successfully! Please find coverted output in ${outputDir} directory.`);
}

const convertAll = () => {
    fs.readdir(source, function (err, filenames) {
        if (err) {
            onError(err);
            return;
        }
        filenames.forEach(function (filename) {
            convertOne(filename)
        });
    });
}

module.exports = {
    convertAll,
    dirArray
}

function removeAttributes(...args) {
    return new Promise((res, rej) => {
        try {
            rsp.remove(...args, res);
        } catch (err) {
            rej(err);
        }
    });
}

