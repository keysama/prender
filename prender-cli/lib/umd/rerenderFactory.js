!function(e){"function"==typeof define&&define.amd?define(e):e()}(function(){"use strict";const s=require("path"),n=require("puppeteer"),r=require("./rerender");module.exports=class{constructor(e={headless:!0},t={waituntil:"networkidle0",timeout:0},{targetDir:i=s.join(__dirname,"./rebuild"),debug:r=!1}){this.puppeteerOptions=e,this.pageOptions=t,this.browser=null,this.puppeteer=n,this.targetDir=i,this.debug=r}async initialize(){if(this.browser)return this.browser;this.browser=await this.puppeteer.launch(this.puppeteerOptions)}async create(e,t,i=this.pageOptions){return this.browser||(this.browser=await this.puppeteer.launch(this.puppeteerOptions)),new r(this.browser,e,t,i,this.targetDir,this.debug)}async close(){await this.browser.close()}}});
