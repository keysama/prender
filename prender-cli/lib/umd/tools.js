!function(n){"function"==typeof define&&define.amd?define(n):n()}(function(){"use strict";const o=require("fs"),s=require("path"),t=require("compressing");function u(n){return!!o.existsSync(n)||(u(s.dirname(n))?(o.mkdirSync(n),!0):void 0)}module.exports={wait:async function(e){return new Promise(n=>{setTimeout(n,e)})},isInstalled:function(n){try{return require.resolve(n),!0}catch(n){return!1}},mkdirsSync:u,createFile:function(e,i,t){u(e),"string"!=typeof t&&(t=JSON.stringify(t)),o.existsSync(s.join(e,i))?o.unlink(s.join(e,i),function(n){o.writeFileSync(s.join(e,i),t,{})}):o.writeFileSync(s.join(e,i),t,{})},copyFile:function e(i,t,r){let n=o.statSync(i);var c=n.isFile();if(r.includes(s.parse(i).name))return!0;if(c)o.copyFileSync(i,t);else{u(t);let n=o.readdirSync(i);n.forEach(n=>{e(s.join(i,n),s.join(t,n),r)})}},compress:function(i){return new Promise((n,e)=>{t.zip.compressDir(i,i+".zip").then(()=>{n("ok")}).catch(n=>{e(n)})})},deleteFolder:function e(i){let n=[];o.existsSync(i)&&(o.statSync(i).isFile()?o.unlinkSync(i):(n=o.readdirSync(i),n.forEach(function(n){n=i+"/"+n,o.statSync(n).isDirectory()?e(n):o.unlinkSync(n)}),o.rmdirSync(i)))}}});
