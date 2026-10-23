import test from 'node:test';
import assert from 'node:assert/strict';
import {syncIllustration} from '../dist/illustration.mjs';
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
test('快速切换人物时不显示上一张，也不让旧的解码结果覆盖新的人物',async()=>{
 const a=deferred(),b=deferred();let count=0;
 const image={hidden:false,src:'old',decode:()=>count++===0?a.promise:b.promise};
 const first=syncIllustration(image,'lin.png'),second=syncIllustration(image,'zhou.png');
 assert.equal(image.hidden,true);a.resolve();assert.equal(await first,false);assert.equal(image.hidden,true);
 b.resolve();assert.equal(await second,true);assert.equal(image.src,'zhou.png');assert.equal(image.hidden,false);
});
test('当前插画失败会明确回调；被新请求取消的旧失败不误报给当前场景',async()=>{
 const a=deferred(),b=deferred();let count=0,errors=0;
 const image={hidden:false,src:'old',decode:()=>count++===0?a.promise:b.promise};
 const first=syncIllustration(image,'old.png',()=>errors++),second=syncIllustration(image,'new.png',()=>errors++);
 a.reject(new Error('cancelled'));await first;assert.equal(errors,0);
 b.reject(new Error('missing'));await second;assert.equal(errors,1);assert.equal(image.hidden,true);
});
