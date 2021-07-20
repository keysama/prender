const path = require("path");
const bable = require("rollup-plugin-babel");



module.exports = [{
    input : path.join(__dirname, "../src/index.js"),
    output: {
        file: path.join(__dirname, "../dist/umd/main.js"),
        format: 'umd',
        sourcemap: true,
        name: 'prender'
    },
    plugins: [
        bable({ // 添加babel插件
            exclude: "node_modules/**" // 排除node_modules下的文件
        })
    ]
  },{
    input : path.join(__dirname, "../src/index.js"),
    output: {
        file: path.join(__dirname, "../dist/es/main.js"),
        format: 'es',
        sourcemap: true
    },
    plugins: [
        bable({ // 添加babel插件
            exclude: "node_modules/**" // 排除node_modules下的文件
        })
    ]
  },{
    input : path.join(__dirname, "../src/pkg/useLoader.js"),
    output: {
        file: path.join(__dirname, "../useCollectLoader/index.js"),
        format: 'cjs',
        sourcemap: true
    },
    plugins: [
        bable({ // 添加babel插件
            exclude: "node_modules/**" // 排除node_modules下的文件
        })
    ]
  },{
    input : path.join(__dirname, "../src/pkg/loader.js"),
    output: {
        file: path.join(__dirname, "../loader/index.js"),
        format: 'cjs',
        sourcemap: true
    },
    plugins: [
        bable({ // 添加babel插件
            exclude: "node_modules/**" // 排除node_modules下的文件
        })
    ]
  },{
    input : path.join(__dirname, "../../constants.js"),
    output: {
        file: path.join(__dirname, "../constants.js"),
        format: 'cjs',
        sourcemap: true
    },
    plugins: [
        bable({ // 添加babel插件
            exclude: "node_modules/**" // 排除node_modules下的文件
        })
    ]
  }]