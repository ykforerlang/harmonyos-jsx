#!/usr/bin/env node

const fs = require('fs')
const getopts = require("getopts");
const chokidar = require('chokidar');
const packz = require('../package.json')
const path = require("path");

const parser = require('@babel/parser')
const generate = require('@babel/generator').default;

const myTraverse = require('./traverse')

const options = getopts(process.argv, {
    alias: {
        w: 'watch',
        v: 'version',
    },
})

if (options.version) {
    console.log(packz.version)
} else {
    const desPath = path.resolve(process.cwd(), "entry/src/main/ets")

    // prepare file
    prepareNecessaryFile(desPath)

    // watch
    chokidar.watch(path.resolve(desPath, "pages-tsx", "*.tsx"), {})
        .on('all', (event, filePath) => {
            const ext = path.extname(filePath)
            if (ext === '.tsx') {
                if (event === "add" || event === "change") {
                    try {
                        const sourceCode = fs.readFileSync(filePath, "utf-8")
                        const ast = parser.parse(sourceCode, {
                            sourceType: "module",
                            plugins: [
                                // enable jsx and flow syntax
                                "jsx",
                                "decorators",
                                "typescript"
                            ],
                        })

                        myTraverse(ast)

                        const etsPath = filePath.replace('pages-tsx', 'pages')
                            .replace('.tsx', '.ets')
                        generateEts(ast, etsPath)
                    } catch (e) {
                        console.warn("TODO  some error")
                    }
                } else if (event === "unlink") {
                    const etsPath = filePath.replace('pages-tsx', 'pages')
                        .replace('.tsx', '.ets')
                    fs.unlinkSync(etsPath)
                } else {
                    // no-op
                }
            }
        })
}


function prepareNecessaryFile(desPath) {
    if (!fs.existsSync(path.resolve(desPath, "pages-tsx"))) {
        fs.mkdirSync(path.resolve(desPath, "pages-tsx"))
    }

    const copyFiles = ["arkts-global.d.ts", "tsconfig.json", "pages-tsx/hsx.ts", "pages-tsx/Index.tsx"]
    copyFiles.forEach((item) => {
        if (!fs.existsSync(path.resolve(desPath, item))) {
            fs.copyFileSync(
                path.resolve(__dirname, "..", "template", item),
                path.resolve(desPath, item)
            )
        }
    })
}


function generateEts(ast, etsPath) {
    const generateInfo = generate(ast, {
        comments: true,
        minified: false
    }, "")

    const finalCode = generateInfo.code
        .replaceAll("______;", "")
        .replace("@Component\nclass", "@Component\nstruct")
        .replace("@Entry\nclass", "@Entry\nstruct")
    fs.writeFileSync(etsPath, finalCode, 'utf-8')
}
