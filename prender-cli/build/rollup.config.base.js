const path = require("path");
const bable = require("rollup-plugin-babel");
const fs = require("fs");

const flist = fs.readdirSync(path.join(__dirname, "../src"));
const inputs = flist.map(filename => {
    return {
        inputFile : path.join(__dirname, "../src", filename),
        filename
    }
})

module.exports = [{
    input : path.join(__dirname, "../../constants.js"),
    output: {
        file: path.join(__dirname, "../constants.js"),
        format: 'umd',
        name: 'prenderConstants',
        sourcemap: true
    },
    plugins: [
        bable({ // 添加babel插件
            exclude: "node_modules/**" // 排除node_modules下的文件
        })
    ]
},...inputs.map( item => {
    return {
        input : item.inputFile,
        output: {
            file: path.join(__dirname, "../lib/umd", item.filename),
            format: 'umd',
            name: 'prenderConstants',
            sourcemap: true
        },
        plugins: [
            bable({ // 添加babel插件
                exclude: "node_modules/**" // 排除node_modules下的文件
            })
        ]
    }
} )]