const { scale } = require("scale-that-svg");
const sharp = require("sharp");
const fs = require("fs");
const pngtosvg = require("potrace");
const SVGFixer = require("oslllo-svg-fixer");
const rsp = require("remove-svg-properties");
const readSVG = require('simple-svg-tools');
const cleanUp = require("./util.js");

const source = "./source";
const firstStageDir = "./first-stage";
const secondStageDir = "./second-stage";
const thirdStageDir = "./third-stage";
const fourthStageDir = "./fourth-stage";
const fifthStageDir = "./fifth-stage";
const outputDir = "./output";

const dirArray = [firstStageDir, secondStageDir, thirdStageDir, fourthStageDir, outputDir];
cleanUp(dirArray)

const scaleToPixelsTemp = 200;
const scaleToPixelsFinal = 24;

const convert = async function () {
    const input = fs.readFileSync(`${source}/icon.svg`, 'utf8');
    const svg = new readSVG.SVG(input);

    //scale svg to 200px
    const scaled = await scale(input, { scale: scaleToPixelsTemp / svg.width })
    fs.writeFileSync(`${firstStageDir}/icon.svg`, scaled);

    //svg to png
    await sharp(`${firstStageDir}/icon.svg`).png().toFile(`${secondStageDir}/icon.png`)

    //png to svg
    pngtosvg.posterize(`${secondStageDir}/icon.png`, function (err, svg) {
        if (err) throw err;
        fs.writeFileSync(`${thirdStageDir}/icon.svg`, svg);
        (async function () {
            //remove fill-rule of evenodd
            await SVGFixer(thirdStageDir, fourthStageDir).fix();

            const input = fs.readFileSync(`${fourthStageDir}/icon.svg`);
            //scale to 24px
            const scaled = await scale(input, { scale: scaleToPixelsFinal / scaleToPixelsTemp })
            fs.writeFileSync(`${fifthStageDir}/icon.svg`, scaled);

            //cleaning up svg(remove unnecessory attribites)
            await rsp.remove({
                src: `${fifthStageDir}/icon.svg`,
                out: outputDir,
                stylesheets: false,
                properties: [rsp.PROPS_STROKE, rsp.PROPS_FILL, 'height', 'width', 'fill-rule', 'color'],
                namespaces: ['i', 'sketch', 'inkscape'],
                log: false
            });

            console.log("\x1b[32m%s\x1b[0m", "done");
        })()
    });
}

module.exports = {
    convert,
    dirArray
}

