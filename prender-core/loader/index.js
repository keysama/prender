'use strict';

var loaderUtils = require("loader-utils");

var _require = require("prender-core/constants"),
    prenderWrapperFunc = _require.prenderWrapperFunc;

function defaultTestFunc(text) {
  if (/\/\*.*preFetch.*\*\//.test(text)) {
    var newText = text.replace(/\/\*.*preFetch.*\*\//, "");
    var markUrl = newText.match(/\(.*?\)/g)[0].replace(/(\(|\)|\s)/g, "");
    var name = "";
    var type = "state";

    try {
      type = text.match(/\[.*\]/g) ? text.match(/\[.*\]/g)[0].replace(/(\[|\])/g, "") : type;
      name = text.match(/\/\*.*preFetch.*\*\//)[0].match(/[\s].*[\s]/g, "")[0].replace(/\s/g, "").split(":")[1];
    } catch (e) {
      return false;
    }

    return {
      markUrl: markUrl,
      newText: newText,
      name: name,
      type: type
    };
  }
  return false;
}

function warp(statement, id, name, type) {
  var staticStatement = statement.replace("t(", "t.bind(axios,");
  console.log("window.".concat(prenderWrapperFunc, "(").concat(staticStatement, ",").concat(id, ",\"").concat(name, "\",\"").concat(type, "\")"));
  return "window.".concat(prenderWrapperFunc, "(").concat(staticStatement, ",").concat(id, ",\"").concat(name, "\",\"").concat(type, "\")");
}

function prenderLoader(source) {
  var testFunc = defaultTestFunc;
  var options = loaderUtils.getOptions(this);
  var axiosStatment = source.match(/axios[\s]*\.(get|post)\(.*?\)/g);

  if (!axiosStatment) {
    return source;
  }

  axiosStatment = axiosStatment[0];

  if (options.test) {
    testFunc = options.test;
  }

  var hitStatment = testFunc(axiosStatment);

  if (!hitStatment) {
    return source;
  }

  var markUrl = hitStatment.markUrl,
      newText = hitStatment.newText,
      name = hitStatment.name,
      type = hitStatment.type;
  return source.replace(axiosStatment, warp(newText, markUrl, name, type));
}

module.exports = prenderLoader;
