(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.prenderConstants = {}));
}(this, (function (exports) { 'use strict';

	const prenderWrapperFunc = "REACT_APP_REWIRED_DYNAMIC_WRAPPER";
	const prenderLoadQueue = "REACT_APP_REWIRED_LOAD_QUEUE";
	const cacheStore = "CACHE_STORE";
	const cacheStoreMode = "CACHE_STORE_MODE";
	const prenderTag = "__PRERENDER_INJECTED";
	const handleRenderToString = "handleRenderToString";

	exports.cacheStore = cacheStore;
	exports.cacheStoreMode = cacheStoreMode;
	exports.handleRenderToString = handleRenderToString;
	exports.prenderLoadQueue = prenderLoadQueue;
	exports.prenderTag = prenderTag;
	exports.prenderWrapperFunc = prenderWrapperFunc;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=constants.js.map
