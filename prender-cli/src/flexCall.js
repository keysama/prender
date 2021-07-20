class FlexCall{
    constructor(maxCall){
      this.maxCall = maxCall;
      this._queue = [];
    }
  
    push(fn,context = null){
      this._queue.push({
        fn,
        res : null,
        status : "block",
        index : this._queue.length,
        context : context
      });
    }
  
    async run(){
      let arr = [];
      for(let i=0;i<this.maxCall;i++){
        arr.push(this.runOne())
      }
      await Promise.all(arr);
      return this._queue.sort((a,b) => a.index - b.index).map(item=>item.res);
    }
  
    async runOne(){
      let unit = this._queue.filter(item => item.status === "block")[0];
      if(!unit){
        return true;
      }else{
        unit.status = "running";
        unit.res = await unit.fn.call(unit.context);
        unit.status = "finish";
        return await this.runOne();
      }
    }
}

module.exports = FlexCall;