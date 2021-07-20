'use strict';

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

require("path");

function useCollectLoader(config, env) {
  var targetRules = config.module.rules[1].oneOf.filter(function (item, key) {
    if (_typeof(item.test) == "object" && !Array.isArray(item.test) && item.test.test(".jsx") && !item.exclude) {
      return true;
    }
  })[0];
  var targetUse = [{
    loader: targetRules.loader,
    options: JSON.parse(JSON.stringify(targetRules.options))
  }, {
    loader: require.resolve("prender-core/loader")
  }];
  delete targetRules.loader;
  delete targetRules.options;
  targetRules.use = targetUse;
  return config;
}

module.exports = useCollectLoader;
