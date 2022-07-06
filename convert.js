const { scale } = require("scale-that-svg");
const sharp = require("sharp");
const fs = require("fs");
const pngtosvg = require("potrace");
const SVGFixer = require("oslllo-svg-fixer");
const rsp = require("remove-svg-properties-2");
const readSVG = require('simple-svg-tools');
const cleanUp = require("./util.js");

const source = "./source";
const firstStageDir = "./temp/first-stage";
const secondStageDir = "./temp/second-stage";
const thirdStageDir = "./temp/third-stage";
const fourthStageDir = "./temp/fourth-stage";
const fifthStageDir = "./temp/fifth-stage";
const sixthStageDir = "./temp/sixth-stage";
const outputDir = "./output";

const dirArray = [firstStageDir, secondStageDir, thirdStageDir, fourthStageDir, fifthStageDir, sixthStageDir, outputDir];
cleanUp(dirArray)

const scaleToPixelsTemp = 200;
const scaleToPixelsFinal = 24;

const convert = async function () {
    //remove width/height
    await removeAttributes({
        src: `${source}/icon.svg`,
        out: firstStageDir,
        stylesheets: false,
        properties: [rsp.PROPS_STROKE, rsp.PROPS_FILL, 'height', 'width', 'color'],
        namespaces: ['i', 'sketch', 'inkscape'],
        log: false
    });

    //scale svg to 200px
    const input = fs.readFileSync(`${firstStageDir}/icon.svg`, 'utf8');
    const svg = new readSVG.SVG(input);
    const max_dimension = Math.max(svg.width, svg.height)
    const scaled = await scale(input, { scale: scaleToPixelsTemp / max_dimension })
    fs.writeFileSync(`${secondStageDir}/icon.svg`, scaled);

    //svg to png
    await sharp(`${secondStageDir}/icon.svg`).png().toFile(`${thirdStageDir}/icon.png`)

    //png to svg
    const convertedSVG = await pngToSvg(`${thirdStageDir}/icon.png`)
    fs.writeFileSync(`${fourthStageDir}/icon.svg`, convertedSVG);

    //remove fill-rule of evenodd
    await SVGFixer(fourthStageDir, fifthStageDir).fix();

    const fillRuleRemovedSVG = fs.readFileSync(`${fifthStageDir}/icon.svg`);
    //scale to 24px
    const scaledDownSVG = await scale(fillRuleRemovedSVG, { scale: scaleToPixelsFinal / scaleToPixelsTemp })
    fs.writeFileSync(`${sixthStageDir}/icon.svg`, scaledDownSVG);

    //cleaning up svg(remove unnecessory attribites)
    await removeAttributes({
        src: `${sixthStageDir}/icon.svg`,
        out: outputDir,
        stylesheets: false,
        properties: [rsp.PROPS_STROKE, rsp.PROPS_FILL, 'height', 'width', 'fill-rule', 'color'],
        namespaces: ['i', 'sketch', 'inkscape'],
        log: false
    });

    console.log("\x1b[32m%s\x1b[0m", `Done! Please find coverted output in ${outputDir} directory.`);
}

module.exports = {
    convert,
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

function pngToSvg(...args) {
    return new Promise((res, rej) => {
        pngtosvg.posterize(...args, (err, svg) => {
            if (err) rej(err)
            res(svg);
        })
    })
}