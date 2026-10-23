import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {NODES} from '../dist/data/story.mjs';
import {createStory,choose,choicesFor,currentPage,presentClue,serializeStory,STORY_SAVE_KEY} from '../dist/narrative.mjs';
import {storyBlocks} from '../dist/paper-ui.mjs';
import {draft} from './story-paths.mjs';

const checkpoints=new Map(),queue=[createStory()],seen=new Set();
while(queue.length){let s=queue.shift();const key=[s.node,!!s.flags.hasProof,s.clues.includes('pressMark'),s.clues.includes('readerReservation'),!!s.flags.packedLedger,!!s.flags.packedProof,s.flags.handoff??''].join(':');if(seen.has(key))continue;seen.add(key);if(!checkpoints.has(s.node))checkpoints.set(s.node,s);if(NODES[s.node].workbench)s=draft(s,true);for(const action of choicesFor(s))if(!action.disabled)queue.push(choose(s,action.id));if(currentPage(s).character)for(const id of s.clues)queue.push(presentClue(s,id));}
assert.equal(checkpoints.size,Object.keys(NODES).length);
const {chromium}=createRequire(resolve(process.env.SHANHE_PLAYWRIGHT_PACKAGE))('playwright');
const out=fileURLToPath(new URL('../tmp/round3-qa/',import.meta.url));await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.SHANHE_BROWSER_PATH});
const context=await browser.newContext({viewport:{width:1366,height:768},locale:'zh-CN',reducedMotion:'reduce'});
await context.route('https://**/*',request=>request.abort()); // 仅测排版，不把图像失败态写成真实史料加载凭据。
const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
const results=[];
try{
 await page.goto('http://127.0.0.1:4177/',{waitUntil:'domcontentloaded'});
 for(const [width,height] of [[1366,768],[1920,1080],[1024,640]]){
  await page.setViewportSize({width,height});let pagesRead=0,minBody=Infinity;
  for(const [id,s] of checkpoints){
   await page.evaluate(({key,raw})=>localStorage.setItem(key,raw),{key:STORY_SAVE_KEY,raw:serializeStory(s)});
   await page.reload({waitUntil:'domcontentloaded'});await page.evaluate(()=>new Promise(requestAnimationFrame));
   assert.equal(await page.locator('#world').getAttribute('data-node'),id);assert.deepEqual(errors,[],id);
   const textById=new Map();
   for(let i=0;i<60;i++){
    const metric=await page.evaluate(()=>{
     const body=document.querySelector('#page-scroll'),b=body.getBoundingClientRect();
     const content=[...document.querySelectorAll('#page-content [data-paper-block]')].map(el=>({id:el.dataset.paperBlock,text:el.textContent,bottom:el.getBoundingClientRect().bottom}));
     const controls=[...document.querySelectorAll('#story-actions button,#stage button,.scene-spot')].filter(el=>el.checkVisibility()&&!el.disabled).map(el=>{const r=el.getBoundingClientRect();return {label:el.textContent.trim().slice(0,30),x:r.x,y:r.y,right:r.right,bottom:r.bottom};});
     return {w:innerWidth,h:innerHeight,sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight,body:body.clientHeight,overflow:body.scrollHeight-body.clientHeight,bottom:b.bottom,content,controls,font:parseFloat(getComputedStyle(document.querySelector('.story-paragraph')??body).fontSize)};
    });
    assert.equal(metric.sw,width,id+' 页面横向溢出');assert.equal(metric.sh,height,id+' 页面纵向溢出');assert.ok(metric.body>=40,id+' 正文高度 '+metric.body);assert.ok(metric.overflow<=2,id+' 正文仍需滚动 '+metric.overflow);assert.ok(metric.font>=16,id+' 正文字号不足');minBody=Math.min(minBody,metric.body);
    for(const item of metric.content){assert.ok(item.bottom<=metric.bottom+2,id+' 正文页溢出');textById.set(item.id,(textById.get(item.id)??'')+item.text);}
    for(const control of metric.controls){assert.ok(control.x>=-2&&control.y>=-2&&control.right<=width+2&&control.bottom<=height+2,id+' 控件越界 '+JSON.stringify(control));}
    pagesRead++;const next=page.locator('#paper-pagination [data-paper-turn="1"]');if(await next.isDisabled())break;await next.click();
   }
   for(const block of storyBlocks(currentPage(s),s).filter(b=>b.kind==='text'))assert.equal(textById.get(block.id),block.text,id+'/'+block.id+' 全文缺失');
  }
  results.push({width,height,nodes:checkpoints.size,pagesRead,minimumBodyHeight:minBody});console.log(JSON.stringify(results.at(-1)));
 }
 const report={status:'passed',clientDate:'2026-10-22',mode:'合法动作重放的全节点布局夹具；不是两条实际点击流程的替代',remoteImages:'关闭；图像加载另由完整UI流程验证',results,pageErrors:errors};
 await writeFile(join(out,'layout-summary.json'),JSON.stringify(report,null,2)+'\n','utf8');
}catch(error){await page.screenshot({path:join(out,'layout-failure.png')});throw error;}finally{await browser.close();}
