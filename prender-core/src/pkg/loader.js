const loaderUtils = require("loader-utils");
const { prenderWrapperFunc } = require("prender-core/constants")

function defaultTestFunc(text){
    if(/\/\*.*preFetch.*\*\//.test(text)){
        let newText = text.replace(/\/\*.*preFetch.*\*\//,"");
        let markUrl = newText.match(/\(.*?\)/g)[0].replace(/(\(|\)|\s)/g,"");
        let name = "";
        let type = "state";
        try{
            type = text.match(/\[.*\]/g) ? text.match(/\[.*\]/g)[0].replace(/(\[|\])/g,"") : type;
            name = text.match(/\/\*.*preFetch.*\*\//)[0].match(/[\s].*[\s]/g,"")[0].replace(/\s/g,"").split(":")[1];
        }catch(e){
            return false;
        }
        return {
            markUrl,
            newText,
            oldText: text,
            name,
            type
        }
    };
    return false;
}

function warp(statement,id,name,type){
    let staticStatement = statement.replace("t(","t.bind(axios,");
    console.log(`window.${prenderWrapperFunc}(${staticStatement},${id},"${name}","${type}")`)
    return `window.${prenderWrapperFunc}(${staticStatement},${id},"${name}","${type}")`;
}

function prenderLoader(source){
    let testFunc = defaultTestFunc;
    
    const options = loaderUtils.getOptions(this);

    let axiosStatment = source.match(/axios[\s]*\.(get|post)\(.*?\)/g);
    if(!axiosStatment){
        return source;
    }

    // axiosStatment = axiosStatment[0];

    if(options.test){
        testFunc = options.test;
    }

    let hitStatments = axiosStatment.map(item => testFunc(item)).filter(item => !!item );

    // let hitStatment = testFunc(axiosStatment);

    // if(!hitStatment){
    //     return source;
    // }
    if(hitStatments.length <= 0){
        return source;
    }

    hitStatments.forEach(item => {
        const { markUrl,oldText,newText,name,type } = item;
        source = source.replace(oldText,warp(newText,markUrl,name,type)) 
    })

    // const { markUrl,newText,name,type } = hitStatment;

    // return source.replace(axiosStatment,warp(newText,markUrl,name,type)) 
    return source;
}

module.exports = prenderLoader;

