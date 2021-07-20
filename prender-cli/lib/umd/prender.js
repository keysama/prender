(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}((function () { 'use strict';

    const FlexCall = require("./flexCall");

    const Server = require("./server");

    const RerenderFactory = require("./rerenderFactory");

    const {
      copyFile
    } = require("./tools");

    class Prender {
      constructor({
        routes,
        port,
        target,
        delta,
        output,
        show,
        incremental,
        exclude,
        timeout = 0,
        pool: syncNum = 5,
        debug
      }) {
        this.routes = routes;
        this.port = port;
        this.target = target;
        this.delta = delta;
        this.output = output;
        this.show = show;
        this.incremental = incremental;
        this.exclude = exclude;
        this.syncNum = syncNum;
        this.debug = debug;
        this.puppeteerOptions = {
          headless: !show
        }, this.pageOptions = {
          waituntil: 'networkidle0',
          timeout: timeout
        }, this._server = new Server({
          port,
          staticPath: target
        });
        this._rerenderFactory = new RerenderFactory(this.puppeteerOptions, this.pageOptions, {
          targetDir: delta,
          debug
        });
      }

      async start() {
        await this._server.initialize();
        await this._rerenderFactory.initialize();
        const flex = new FlexCall(this.syncNum);

        for (let i = 0; i < this.routes.length; i++) {
          flex.push(async () => {
            const item = this.routes[i];
            const rerender = await this._rerenderFactory.create(`http://localhost:${this.port}${item.path}`, item.mode);
            return rerender.start();
          });
        }

        let results = await flex.run();

        if (!this.debug) {
          await this._rerenderFactory.close();

          this._server.destroy();
        } else {
          console.log("finish rerender");
        }

        try {
          if (!this.incremental) {
            copyFile(this.target, this.output, this.exclude);
            copyFile(this.delta, this.output, this.exclude);
          }
        } catch (e) {}

        return results;
      }

    }

    module.exports = Prender;

})));
//# sourceMappingURL=prender.js.map
