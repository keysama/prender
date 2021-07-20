const path = require("path");

function useCollectLoader(config,env){
    let targetIndex;

    let targetRules = config.module.rules[1].oneOf.filter((item,key)=>{
        if(typeof item.test == "object" && !Array.isArray(item.test) && item.test.test(".jsx") && !item.exclude ){
            targetIndex = key;
            return true;
        }
    })[0];

    let targetUse = [
        {
            loader : targetRules.loader,
            options : JSON.parse(JSON.stringify(targetRules.options))
        },
        {
            loader : require.resolve("prender-core/loader")
        }
    ]

    delete targetRules.loader;
    delete targetRules.options;

    targetRules.use = targetUse;

    return config
}

module.exports = useCollectLoader