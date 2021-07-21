# prender

### use prender-core in project and use prender-cli to make static files


## prender-core
### use yarn add or npm install
```
    yarn add prender-core -S
```

### import prenderInitSsr 
```
    import { prenderInitSsr } from 'prender-core';
```

### use loader prender-core/prenderLoader
```
    import prenderLoader from "prender-core/prenderLoader"
    use prenderLoader in webpack configuration as a normal js laoder

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
### or if you use create-react-app, you can use prender-core/useCollectLoader
```
    //config-overrides.js
    const useCollectLoader = require('prender-core/useCollectLoader');

    const {
        override
    } = require('customize-cra');

    module.exports = override(useCollectLoader)
```

### void prenderInitSsr in entry file
```
    //prenderInitSsr must receives a function that contains a parameter
    "location" looks like "/" or "/hello" and returns a document string created by ReactDOMServer.renderToString

    //index.js
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

    //don't care about how getPrenderData works, give it url and return data like axios
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
    yarn build or react-app-rewired build
```



## prender-cli
### after building with prender-core, you can use prender-core to rebuild the build folder

### installing
```
    yarn add -g prender-cli or
    npm install -g prender-cli
```

### rebuild 
```
    prender build /home /thePathYouWantToStaticify --target=./yourBuildFolderPath 
```

### options
```
    to check the options list,use
    prender build -h
```

## prender mode
```
    prender build ... -m default | json | inject
```
### there are 3 modes to change the result of prender
- json : extract the request with url types of [env] and [parameter]

- inject : inject the request with url types of [env] and [parameter]

- default : inject the request with url types of [env], and extract the request with url types of [parameter]