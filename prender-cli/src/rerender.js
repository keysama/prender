const path = require('path');
const urlLib = require('url');
const {
    prenderTag,
    cacheStore,
    cacheStoreMode,
    handleRenderToString,
    prenderLoadQueue
} = require('../../constants');

const { 
    wait,
    createFile
} = require("./tools");

class Rerender {
    constructor(browser, url, mode, pageOptions, targetDir = path.join(__dirname, "./rebuild"), debug = false) {
      this.browser = browser;
      this.url = url;
      this.mode = mode; // script json default:script
      this.pageOptions = pageOptions;
  
      this.rootPath = targetDir;
      this.unitPath = urlLib.parse(url).path.slice(1).replace("%20"," ");
      this.page = null;
      this.injectObj = { mode, rootPath: this.rootPath, url, unitPath: this.unitPath  };
      this.defaultWaitTime = 5000;
      this.debug = debug;
      
    }
  
    async start() {
      if (!this.browser) {
        throw new Error('no puppeteer instence');
      }
  
      try{
        console.log("===1===")
        this.page = await this.browser.newPage();

        console.log("===2===")
        await this.filterRequest();
  
        console.log("===3===")
        await this.preInject(prenderTag, this.injectObj);
  
        console.log("===4===")
        await this.page.goto(this.url, {...this.pageOptions, timeout : 0});
  
        console.log("===5===")
        await wait(this.defaultWaitTime);
  
        console.log("===6===")
        this.cacheData = await this.collectRequest();

        console.log("cached", this.cacheData)
  
        const { computedInjectData, computedFileData } = await this.digest(this.mode,this.cacheData);
  
        console.log("===7===")
        await this.reactReRender(urlLib.parse(this.url).pathname, computedInjectData);
  
        console.log("===8===")
        let dependentNum = await this.produce(computedFileData);
  
        if(!this.debug){
          console.log("===9===")
          await this.page.close();
        }
  
        return dependentNum;  
  
      }catch(e){
        console.log("==============error===============")
        if(/TimeoutError/g.test(e.stack)){
            console.log("超时自动关闭，",this.url)
        }else{
            console.log(e)
        }
        console.log("==================================")
        // await this.page.close();
        return 'error';
      }
    }
  
    async filterRequest(){
      this.page.on('request', (interceptedRequest) => {
        const url = interceptedRequest.url();
        const fileName = interceptedRequest.url().split('.')[
          interceptedRequest.url().split('.').length - 1
        ];
  
        const ignoreList = ["pixlee_widget_1_0_0.js","heatmap.min.js","cdn1-sandbox.affirm.com","googleapis.com","mages.unsplash.com"];
  
        if (/(png|jpg|webp|woff2|woff|ttf|jpeg|svg|css)/g.test(fileName)) {
          interceptedRequest.abort(); // 终止请求
        } else if(ignoreList.filter(item => url.includes(item)).length > 0){
          interceptedRequest.abort(); 
        } else {
          interceptedRequest.continue(); // 弹出
        }
      });
  
      await this.page.setRequestInterception(true);
    }
  
    async preInject(name, data) {
      await this.page.evaluateOnNewDocument(
        `(function () { window['${name}'] = ${JSON.stringify(data)}; })();`
      );
    }
  
    async collectRequest() {
      this.dataList = await this.page.evaluate(( timeout, prenderLoadQueue ) => {
        return new Promise((resolve) => {
          function check(){
            if(!window[prenderLoadQueue] || window[prenderLoadQueue].size > 0){
                console.log("===check===")
              window.setTimeout(check,2000)
            }else{
              const arr = [];
              const resources = document.querySelectorAll("[tag='PRERENDER_INJECTED']");
              for (let i = 0; i < resources.length; i++) {
                arr.push({
                  origin_id : resources[i].getAttribute('url'),
                  id: resources[i].id,
                  data: JSON.parse(resources[i].text),
                  name: resources[i].getAttribute('name'),
                  type: resources[i].getAttribute('type'),
                });
              }
      
              const head = document.getElementsByTagName('head')[0];
          
              for (let i = 0; i < resources.length; i++) {
                head.removeChild(resources[i]);
              }
  
              resolve(arr);
            } 
          }
  
          if(timeout !== 0){
            setTimeout(() => { resolve([]) } ,timeout)
          }
  
          check();
        });
      }, this.pageOptions.timeout, prenderLoadQueue);
  
      return this.dataList;
    }
  
    async digest(mode,data) {
      let computedInjectData = {};
      let computedFileData = [];
  
      if(mode === 'inject'){
        computedInjectData = data.reduce((pre,next) => {
          pre[next.id] = next.data;
          return pre;
        },{})
        computedFileData = [];
  
      }else if(mode === 'json'){
        computedInjectData = {}
        computedFileData = data.filter(item => item.type === "env" || item.type === "parameter");
  
      }else{
        computedInjectData = data.reduce((pre,next) => {
          if(next.type == "env"){
            pre[next.id] = next.data;
          }
          return pre;
        },{})
        computedFileData = data.filter(item => item.type === "parameter");
      }
  
      await this.insertScript(cacheStore,computedInjectData)
      await this.insertScript(cacheStoreMode,mode);
  
      return { computedInjectData,computedFileData };
      
    }
  
    async reactReRender(location, store){
      return await this.page.evaluate((location, store, handleRenderToString) => {
        return new Promise((resolve) => {
          if(!window[handleRenderToString]){
            console.log("no handle")
            return 
          }
  
          console.log("handle===start")
          const reactContent = window[handleRenderToString](location, store);
          console.log("handle===end")
  
  
          document.getElementById('root').innerHTML = reactContent;
          resolve();
        });
      }, location, store, handleRenderToString);
    }
  
    async produce(jsons) {
      await this.reRenderCss();
  
      for(let i = 0;i < jsons.length;i ++){
        createFile(path.join(this.rootPath, "./jsons/"), jsons[i].id + ".json",jsons[i].data);
      }
  
      const content = await this.page.content(); // 获取内容
      const dependent = JSON.stringify(jsons.map(item => ({
            origin_id : item.origin_id,
            id : item.id
          })
        )
      );
  
      await createFile(path.join(this.rootPath,this.unitPath,"./"), 'index.html', content); // 生成html
      await createFile(path.join(this.rootPath,this.unitPath,"./"), 'dependent.json', dependent);
  
      return jsons.length;
    }
  
    async insertScript(name, data){
      return await this.page.evaluate((name, data) => {
        const scriptTag = document.createElement('script');
        scriptTag.type = 'text/javascript';
        const code = `
              (function(){ 
                  window["${name}"] = ${JSON.stringify(data)}
                }
              )()
            `;
        scriptTag.appendChild(document.createTextNode(code));
        document.getElementsByTagName('head')[0].appendChild(scriptTag);
      }, name, data);
    }
  
    async reRenderCss() {
      const styleSheetData = await this.page.evaluate(() => {
        return new Promise((resolve) => {
          function collectStyles() {
            const styleSheets = [];
            for (let i = 0; i < document.styleSheets.length; i++) {
              const item = document.styleSheets[i];
              item.ownerNode.localName === 'style' && styleSheets.push(item);
            }
  
            return styleSheets.map((styleNode) => {
              const attributes = {};
              let text = '';
  
              styleNode.ownerNode.attributes.forEach((item) => {
                attributes[item.nodeName] = item.nodeValue;
              });
  
              styleNode.rules.forEach((item) => {
                text += item ? item.cssText : '';
              });
  
              return {
                type: styleNode.type,
                attributes,
                text: text.trim(),
              };
            });
          }
  
          function deleteStyles() {
            for (
              let i = document.head.getElementsByTagName('style').length - 1;
              i >= 0;
              i--
            ) {
              document.head.removeChild(document.head.getElementsByTagName('style')[i]);
            }
          }
  
          function createStyles(styles) {
            for (let i = 0; i < styles.length; i++) {
              const styleItem = styles[i];
  
              const styleTag = document.createElement('style');
  
              styleTag.type = styleItem.type;
  
              Object.keys(styleItem.attributes).forEach((attrname) => {
                if (!styleItem.attributes[attrname]) {
                  const attrItem = document.createAttribute(attrname);
                  styleTag.attributes.setNamedItem(attrItem);
                } else {
                  styleTag.setAttribute(attrname, styleItem.attributes[attrname]);
                }
              });
  
              styleTag.appendChild(document.createTextNode(styleItem.text));
  
              document.head.append(styleTag);
            }
          }
          const styleSheetData = collectStyles();
          deleteStyles();
          createStyles(styleSheetData);
          resolve(styleSheetData);
        });
      });
  
      return styleSheetData;
    }
  
  }

  module.exports = Rerender;