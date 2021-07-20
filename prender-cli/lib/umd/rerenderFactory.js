(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}((function () { 'use strict';

    const path = require('path');

    const puppeteer = require("puppeteer");

    const Rerender = require("./rerender");

    class RerenderFactory {
      constructor(puppeteerOptions = {
        headless: true
      }, pageOptions = {
        waituntil: 'networkidle0',
        timeout: 0
      }, {
        targetDir = path.join(__dirname, "./rebuild"),
        debug = false
      }) {
        this.puppeteerOptions = puppeteerOptions;
        this.pageOptions = pageOptions;
        this.browser = null;
        this.puppeteer = puppeteer;
        this.targetDir = targetDir;
        this.debug = debug;
      }

      async initialize() {
        if (this.browser) {
          return this.browser;
        }

        this.browser = await this.puppeteer.launch(this.puppeteerOptions);
      }

      async create(url, mode, pageOptions = this.pageOptions) {
        if (!this.browser) {
          //to do
          this.browser = await this.puppeteer.launch(this.puppeteerOptions);
        }

        return new Rerender(this.browser, url, mode, pageOptions, this.targetDir, this.debug);
      }

      async close() {
        await this.browser.close();
      }

    }

    module.exports = RerenderFactory;

})));
//# sourceMappingURL=rerenderFactory.js.map
