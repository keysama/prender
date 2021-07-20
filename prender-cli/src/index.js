const program = require("commander");
const path = require("path");
const fs = require('fs');
const Table = require('cli-table2');
const Prender = require("./prender.js");
const chalk = require('chalk');

const { compress, deleteFolder } = require('./tools');
//folder为自定义要压缩的文件夹

let table = new Table({
  head: [ 'path', 'mode' ], 
  colWidths: [ 20, 20 ]
})
let table2 = new Table({
  head: [ 'path', 'mode', 'depent', 'status' ], 
  colWidths: [ 20, 20, 20, 20 ]
})

program.version('0.1.0');

program
  .command('build [routes...]')
  .description('run to rerender all routes with mode')
  .option('-p --port [port]', '临时服务端口号', 8098)
  .option('-t --target [target]', '目标路径', path.join(process.cwd(), './target'))
  .option('-d --delta  [delta]', '增量更新输出目录', path.join(process.cwd(), './delta'))
  .option('-o --output [output]', '全量更新输出目录', path.join(process.cwd(), './output'))
  .option('-f --file [file]', '指定包含routes和mode的文件位置', path.join(process.cwd(), './prender_routes.json'))
  .option('-e --exclude [exclude...]', '忽略的文件', '.DS_Store')
  .option('-s --show', '是否显示浏览器', false)
  .option('-i --incremental', '开启增量更新模式', false)
  .option('-c --clear', '开始前删除输出目录', false)
  .option('-z --zip', '输出压缩文件', false)
  .option('-m --mode [mode...]', '输出模式[json/inject/default]', ["default"])
  .option('--timeout [timeout]', '单个路由渲染时限,0不限制', 0)
  .option('--pool [pool]', '允许同时渲染最大数量', 5)
  .option('--debug', 'debug模式，不自动关闭', false)
  .action(async (routes,cmd) => {

    const { file: jsonFile, mode, port, target, delta, output, show, incremental, exclude, debug, clear, zip, timeout, pool } = cmd;

    let computedRoutes = [];

    if(typeof mode === "string"){
      computedRoutes = routes.map(item => ({
        path : item,
        mode : mode
      }))
    }else{
      if( mode.length !== routes.length && mode.length !== 1 ){
        console.log(chalk.red("illegal mode options"))
        return false;
      }
      computedRoutes = routes.map((item,key) => ({
        path : item,
        mode : mode[key] || mode[0]
      }))
    };

    if(computedRoutes.length <= 0 && !fs.existsSync(jsonFile)){
      console.log(chalk.red("no routes to render"))
    }

    if(computedRoutes.length <= 0 && fs.existsSync(jsonFile)){
      let fileContent = require(path.resolve( process.cwd(), jsonFile ));
      if (Array.isArray(fileContent)){
        computedRoutes = fileContent.map(item => ({ path : item, mode : mode[0] }))
      }else{
        computedRoutes = fileContent;
      }
    };

    if(clear){
      deleteFolder(output);
      deleteFolder(delta);
      deleteFolder(output+".zip");
    }

    table.push(...computedRoutes.map((item, key )=>[ item.path , item.mode ]));

    process.stdout.write(table.toString() + "\n")

    var twirlTimer = (function() { var P = ["\\", "|", "/", "-"]; var x = 0; return setInterval(function() { process.stdout.write("\r" + P[x++]); x &= 3; }, 100); })();

    const my = new Prender({
      routes: computedRoutes, port, target, delta, output, show, incremental, exclude, timeout, pool, debug
    })

    const results = await my.start();

    if(zip){
      try{
        await compress(output)
      }catch(e){
        throw new Error(chalk.red("compress error"))
      }
    }

    process.stdout.write("\n");

    clearInterval(twirlTimer);

    table2.push(...computedRoutes.map((item, key )=>[item.path, item.mode, !results ? "error" : results[key], !results || results[key] === "error" ? chalk.red("error") : chalk.green('success') ]))

    console.log(table2.toString())

    if(!debug){
      process.exit(0);
    }else{
      console.log("finish all")
    }
    
  })

program.parse(process.argv);