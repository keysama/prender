# prender

### 使用prender只需要修改少量代码，通过给发送的请求添加注释标记，即可使用命令行将打包后的文件，根据不同的静态化策略，使用模拟浏览器访问并将请求结果分离为json文件或注入到html中，利用renderToString将请求结果注入react渲染出首屏页面

例如你可以使用
prender build /homepage --target=./build --output=./newBuild
这将以当前目录下的build文件夹作为输入，以default模式输出一个新的静态化目录newBuild

### prender大致做了什么
prender会启动一个本地服务尝试访问/homepage页面，配置多个页面以空格分割例如/home /login，也可以指定一个json文件：
```
    prender build --target=./build --output=./newBuild --file=./prender_routes.json
    or
    prender build -t ./build -o ./newBuild -f ./prender_routes.json
```

在json文件中指定包含需要静态化的路径数组
```
    //prender_routes.json
[
    "/homepage",
    "/login",
    ...
]
```

对特定路径设置不同的mode
```
    //prender_routes.json
[
   {
       "path" : "/homepage",
       "mode" : "inject"
   },
   {
       "path" : "/login",
       "mode" : "json"
   }
]
```

在访问/homepage期间，将把带有特定标记的请求结果保存，根据设置，可以将结果注入到html文件中，以减少请求次数。也可以将结果另存为json文件，并修改请求逻辑使其自动访问该json文件，以静态化一部分请求。

除此之外，也可以添加更多参数以控制prender的效果

```
  -p --port [port]           临时服务端口号 (default: 8098)
  -t --target [target]       目标路径 (default: "/Users/user/Desktop/work/mik-web/target")
  -d --delta  [delta]        增量更新输出目录 (default:
                             "/Users/user/Desktop/work/mik-web/delta")
  -o --output [output]       全量更新输出目录 (default:
                             "/Users/user/Desktop/work/mik-web/output")
  -f --file [file]           指定包含routes和mode的文件位置 (default:
                             "/Users/user/Desktop/work/mik-web/prender_routes.json")
  -e --exclude [exclude...]  忽略的文件 (default: ".DS_Store")
  -s --show                  是否显示浏览器 (default: false)
  -i --incremental           开启增量更新模式 (default: false)
  -c --clear                 开始前删除输出目录 (default: false)
  -z --zip                   输出压缩文件 (default: false)
  -m --mode [mode...]        输出模式[json/inject/default] (default: ["default"])
  --timeout [timeout]        单个路由渲染时限,0不限制 (default: 0)
  --pool [pool]              允许同时渲染最大数量 (default: 5)
  --debug                    debug模式，不自动关闭 (default: false)
```
 

## prender-core
### 安装
```
    yarn add prender-core -S
    or
    npm install prender-core -S
```

### 使用loader
#### prenderLoader将完成你对请求的标记的收集和处理，如何标记请求
```
    const prenderLoader = require("prender-core/prenderLoader");

    //为jsx添加一个prenderLoader，放在第一个，即让他在最后执行
    ...
        {
            test : /.jsx$/,
            use : [
                "prenderLoader"
                ...
            ]
        }
    ...
```
### 如果用了create-react-app，可以用react-app-rewired和customize-cra，配合prender-core/useCollectLoader完成loader的添加
```
    //config-overrides.js
    const useCollectLoader = require('prender-core/useCollectLoader');

    const {
        override
    } = require('customize-cra');

    module.exports = override(useCollectLoader)
```

### 在入口文件引入prenderInitSsr
```
    //index.js

    import { prenderInitSsr } from 'prender-core';

    //prenderInitSsr接受一个函数作为参数，函数有一个参数location，即通过prender build配置的路由地址，需要返回由ReactDOMServer.renderToString生成的dom字符串（你只需要将Router改为StaticRouter 并传入localtion，其他与react.render中的结构一致）

    //"location" looks like "/" or "/hello" and returns a document string created by ReactDOMServer.renderToString

    prenderInitSsr(function(location){
        return ReactDOMServer.renderToString(
            <React.StrictMode>
                ...
                    <StaticRouter location={localtion}>
                    <App />
                    </StaticRouter>
                ...
            </React.StrictMode>
        ); 
    })
```

### mark static request
```
    //someComponent.js
    import { getPrenderData } from 'prender-core';
    
    ...
    const url = "https://" + props.someVariable；

    //getPrenderData接受一个url地址，即通过/* preFetch[env] */标记的url地址，即可返回axios.get返回的内容

    const [ data, setData ] = useState(getPrenderData(url) || null);

    useEffect(() => {
        ...
            // add a tag like this, there are 2 tags[env][parameter] to tell prender how to deal with this request
            //[env] means this url is defined by local variable
            //[parameter] means this url depends on the browser url or local variable
            axios.get(url /* preFetch[env] */)
        ...
    })
```

### run build
```
    yarn build
    or 
    react-app-rewired build
```


## prender-cli
### 使用prender-core构建过后的项目，可以用prender-cli将文件夹再次render静态化

### installing
```
    yarn add -g prender-cli
    or
    npm install -g prender-cli
```

### rebuild 
```
    prender build /home /thePathYouWantToStaticify --target=./yourBuildFolderPath 
```

### options
```
    prender build [routes...] --target=theFolderYouWantToStaticify --mode=default --show --zip ...

    更多参数查看
    prender build -h
```

## prender mode
```
    prender build ... -m default | json | inject
```
### 有3个mode可供选择
- json : 提取标记是 [env] 和 [parameter] 的请求

- inject : 注入标记是 [env] 和 [parameter] 的请求

- default : 注入标记是 [env] 的请求, 提取标记是 [parameter] 的请求
