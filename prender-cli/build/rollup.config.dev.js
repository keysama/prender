const configList = require('./rollup.config.base');

const config = configList.map(config => {
    config.output.sourcemap = true;
    
    return config;
})


module.exports = config;