import { prenderWrapperFunc,prenderLoadQueue,cacheStore,cacheStoreMode } from "../../../constants";

import { isInPuppeteer, transUrlToId } from "../tools";

export { isInPuppeteer };

export function prenderInit(){
  console.log("5:50")
  window[prenderWrapperFunc] = async ( promise, url, name ,type) => {
    window[prenderLoadQueue] = window[prenderLoadQueue] || new Set();
    window[prenderLoadQueue].add(url)
    return new Promise(async (resolve,reject) => {
  
      const isInBrowser = !isInPuppeteer();
      const json_id = transUrlToId(url);
      let res = null;
  
      if(isInBrowser){
  
        if(window[cacheStore] && window[cacheStore][json_id]){
          return resolve(window[cacheStore][json_id]);
        }
  
        //no cache,try to find json file
        const mode = window[cacheStoreMode] || "";
        let hasJson = false;
        
        if(mode === "default" && type === "parameter"){
          hasJson = true;
        }
        if(mode === "json" && ( type === "parameter" || type === "env")){
          hasJson = true;
        }
  
        if(hasJson){
          try {
            res = await fetch(`/jsons/${json_id}.json`);
            res = await res.json();
            //has json
            return resolve(res);
          }catch(e){
            console.warn("can not find json file :" + `/jsons/${json_id}.json`);
          }
        }
      }
  
      try{
        res = await promise();
      }catch(e){
        return reject(e);
      }
  
      if(!isInBrowser){
        //in puppeteer
        cacheData(url,json_id,res,name,type);
      }
      
      return resolve(res)
    }).finally(() => {
      console.log("====delete====set")
      window[prenderLoadQueue].delete(url)
    })
  }
}

function defaultWrapTemplate(data){
  return JSON.stringify(data);
}

function cacheData(url,id,data,name,type,wrapTemplate = defaultWrapTemplate){
  const scriptTag = document.createElement("script");
  scriptTag.type= 'text/javascript';
  scriptTag.id = id;
  scriptTag.setAttribute("url",url);
  scriptTag.setAttribute("tag","PRERENDER_INJECTED");
  scriptTag.setAttribute("name",name);
  scriptTag.setAttribute("type",type);
  const code = wrapTemplate(data);

  try {
      //Chrome
      scriptTag.appendChild(document.createTextNode(code));
  }
  catch (ex) {
      //IE
      scriptTag.text = code;
  }
  document.getElementsByTagName('head')[0].appendChild(scriptTag);
}