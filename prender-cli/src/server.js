const Koa = require("koa");
const koaStatic = require("koa-static");
const Router = require("koa-router");
const path = require("path");
const fs = require("fs");

class Server {
    constructor({ port = 8910, staticPath = path.join(__dirname,"./target") }){
      this.port = port;
      this.staticPath = staticPath;
      this._app = new Koa();
      this._nativeServer = null;
      this._router = new Router();
    }
  
    async initialize(){
      return new Promise(resolve => {
        this._app.use(koaStatic(path.resolve(this.staticPath)));
        this._router.get(/.*/, async (ctx, next) => {
          ctx.type = 'html';
          ctx.body = fs.createReadStream(path.join(this.staticPath,"./index.html"));
          await next();
        })
        this._app.use(this._router.routes());
        this._app.use(this._router.allowedMethods());
        this._nativeServer = this._app.listen(this.port,resolve);
      })
    }
  
    destroy () {
      this._nativeServer.close()
    }
}

module.exports = Server;