import { cacheStore, handleRenderToString } from "../../../constants";
import { transUrlToId } from "../tools";
import { prenderInit } from "../libs/runtime";

prenderInit();

export function prenderInitSsr(fn){
    window[handleRenderToString] = function (localtion, preRenderStore) {
        window[cacheStore] = preRenderStore;
        return fn && fn(localtion);
    };
}

export function getPrenderData(url){
    let id = transUrlToId(url);
    if(!window[cacheStore] || !window[cacheStore][id]){
        return null;
    }
    return window[cacheStore][id];
}

