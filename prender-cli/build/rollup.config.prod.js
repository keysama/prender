const { uglify } = require('rollup-plugin-uglify');
const configList = require('./rollup.config.base');

const config = configList.map(config => {
    config.output.sourcemap = false;
    config.plugins = [
      ...config.plugins,
      ...[
        uglify()
      ]
    ];
    return config;
})


module.exports = config;