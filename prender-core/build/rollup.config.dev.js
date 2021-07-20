const path = require('path');
const serve = require('rollup-plugin-serve');
const configList = require('./rollup.config');

const resolveFile = function(filePath) {
  return path.join(__dirname, '..', filePath)
}
const PORT = 3001;

const config = configList[0];

config.output.sourcemap = true;
config.plugins = [
  ...config.plugins,
  // ...[
  //   serve({
  //     port: PORT,
  //     contentBase: [resolveFile('example'), resolveFile('dist')]
  //   })
  // ]
]

module.exports = configList;