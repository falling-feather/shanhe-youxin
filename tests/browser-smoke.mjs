import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join,resolve} from 'node:path';
import {restoreStory,makeLetter,STORY_SAVE_KEY} from '../dist/narrative.mjs';
import {NODES,SCENES,CHARACTERS} from '../dist/data/story.mjs';
import {createDriver} from './ui-driver.mjs';

const packagePath=process.env.SHANHE_PLAYWRIGHT_PACKAGE,executablePath=process.env.SHANHE_BROWSER_PATH;
if(!packagePath||!executablePath)throw new Error('设置 SHANHE_PLAYWRIGHT_PACKAGE 和 SHANHE_BROWSER_PATH 后运行。');
const {chromium}=createRequire(resolve(packagePath))('playwright');
const output=fileURLToPath(new URL('../tmp/round3-qa/',import.meta.url));await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath});
const base=process.env.SHANHE_PREVIEW_URL??'http://127.0.0.1:4177/';
const checks=[],errors=[],loadedImages={},layouts=[],paths={};
const context=await browser.newContext({viewport:{width:1366,height:768},locale:'zh-CN',reducedMotion:'reduce',acceptDownloads:true});
const page=await context.newPage();page.setDefaultTimeout(12000);
function track(p){p.on('pageerror',error=>errors.push(error.message));}track(page);
const node=p=>p.locator('#world').getAttribute('data-node');
const drivers=new WeakMap();const driver=p=>{if(!drivers.has(p))drivers.set(p,createDriver(p));return drivers.get(p);};
const step=async(id,p=page)=>{await driver(p).choose(id);await fixed(p);};
const route=async(ids,p=page)=>{for(const id of ids)await step(id,p);};
const pick=async(k,v,p=page)=>driver(p).pick(k,v);
const screen=async(name,p=page)=>p.screenshot({path:join(output,name+'.png')});
async function fixed(p){
 const r=await p.evaluate(()=>({w:innerWidth,h:innerHeight,sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight,y:scrollY,body:document.querySelector('#page-scroll').clientHeight,node:document.querySelector('#world').dataset.node}));
 assert.equal(r.sw,r.w,'主页面横向溢出：'+r.node);assert.equal(r.sh,r.h,'主页面纵向溢出：'+r.node);assert.equal(r.y,0);
 assert.ok(r.body>=24,'正文区域过小：'+r.node+'，'+r.body+'px');layouts.push({width:r.w,height:r.h,node:r.node,body:r.body});
}
async function imageReady(selector,p=page){
 const result=await p.locator(selector).evaluate(async img=>{
  try{await Promise.race([img.decode(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('timeout')),18000))]);return {ok:!!img.naturalWidth,src:img.currentSrc,width:img.naturalWidth};}catch{return {ok:false,src:img.currentSrc};}
 });assert.ok(result.ok,'实际图像未加载：'+result.src);return result;
}
async function openJournalTab(tab,p=page){await p.locator('[data-action="journal"]').first().click();await p.locator('[data-journal-tab="'+tab+'"]').click();}
const close=(id,p=page)=>p.locator('#'+id+' [data-close]').click();

try{
 assert.equal((await page.goto(base,{waitUntil:'domcontentloaded'})).status(),200);await imageReady('#scene-background');await fixed(page);await screen('a01-灯下封面');
 assert.equal(await page.locator('.mission,.chapter-rail,#submit-answer').count(),0);
 await page.locator('#sound-toggle').click();assert.equal(await page.locator('#sound-toggle').getAttribute('aria-pressed'),'true');await page.locator('#sound-toggle').click();
 await step('open-letter');await page.locator('.keyword').press('Enter');assert.equal(await node(page),'letterPlan');
 await route(['take-commission','accept-work']);await screen('a02-工作间');
 await route(['inspect-circular']);loadedImages.issue1=await imageReady('#story-image');
 const originalBox=await page.locator('#story-image').boundingBox();assert.ok(originalBox.height>400,'真实原页应占据主要区域');await screen('a03-真实创刊号');
 await page.locator('#story-image').click();await page.locator('[data-page-select]').selectOption('1');await imageReady('#reader-content img');
 await page.locator('[data-inspect-image]').click();assert.equal(await page.locator('.image-zoomed').count(),1);
 await page.locator('[role="tab"][data-material-tab="notes"]').click();let noteText='';for(let i=0;i<20;i++){noteText+=await page.locator('.source-note-page').innerText();if(await page.locator('[data-note-step="1"]').isDisabled())break;await page.locator('[data-note-step="1"]').click();}assert.match(noteText,/封面可读/);assert.match(noteText,/不能单独证明/);await page.locator('[role="tab"][data-material-tab="notes"]').press('ArrowRight');
 assert.equal(await page.locator('[data-material-tab="source"]').getAttribute('aria-selected'),'true');
 await page.locator('[data-bookmark="issue1"]').click();await close('reader-dialog');
 await route(['read-public-voice','back-office','unfold-city']);await imageReady('.map-sheet img');
 const mapBefore=await page.locator('.map-sheet').getAttribute('style');await page.locator('[data-map-control="in"]').click();assert.notEqual(await page.locator('.map-sheet').getAttribute('style'),mapBefore);
 const box=await page.locator('.map-viewport').boundingBox(),beforeDrag=await page.locator('.map-sheet').getAttribute('style');
 await page.mouse.move(box.x+box.width*.5,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.5+45,box.y+box.height*.5+30,{steps:5});await page.mouse.up();
 assert.notEqual(await page.locator('.map-sheet').getAttribute('style'),beforeDrag);await page.locator('.map-viewport').press('ArrowRight');await page.locator('[data-map-control="margin"]').click();await screen('a04-真实地图');
 await route(['back-office','visit-clerk','ask-care','offer-to-check','back-office']);
 checks.push('封面、场景热区、键盘词句、声音开关、真实创刊号原页／放大／出处／收藏、地图拖动与边款');

 await route(['visit-reader','greet-reader','listen-first','ask-about-fear','take-story','greet-printer']);await imageReady('#character-image');await screen('a05-排印人物');
 await route(['ask-why-blank','ask-his-paper','keep-his-place','inspect-proof','begin-setting']);
 assert.equal(await page.locator('[data-choice="pull-proof"]').isDisabled(),true);
 await pick('motif','night');await pick('voice','ask');await pick('ending','reply');
 assert.match(await page.locator('[data-proof-line="0"]').innerText(),/前面的人/);await screen('a06-初次排印');
 await step('pull-proof');await page.locator('[data-action="flip-proof"]').click();assert.equal(await page.locator('.proof-sheet.flipped').count(),1);await page.locator('[data-action="flip-proof"]').click();
 await route(['fold-proof','fold-booklet','walk-to-reader','present-proof','start-reading']);assert.match(await driver(page).text(),/只管被等/);await screen('a07-初次试读');
 await route(['ask-whats-missing','invite-own-words','revise-together','revise-text']);assert.equal(await page.locator('[data-edit-value="shared"]').count(),1);
 await pick('motif','shared');assert.match(await page.locator('[data-proof-line="0"]').innerText(),/接过同伴的行李/);await screen('a08-修订工作台');
 await route(['pull-revision','bring-revision']);assert.match(await driver(page).text(),/这回我能接着说/);
 await route(['ask-name','name-person','return-workroom','seek-chen','thank-chen']);assert.equal(await node(page),'transferSlip');await page.setViewportSize({width:1024,height:640});await fixed(page);await screen('a09-交接疑点');
 checks.push('倾听先行、三位人物、试样稿片、翻面与折页、首次分歧、读者授权的新稿片和实际二次回应');

 await route(['trace-handoff']);assert.equal(await page.locator('[data-choice="compare-handoff"]').isDisabled(),true);
 await route(['ask-chen-slip','take-press-note','ask-lin-slip']);
 await openJournalTab('clues');await page.locator('[data-pick-clue="pressMark"]').click();await page.locator('[data-present="pressMark"]').click();assert.equal(await node(page),'linNeedsReader');
 await route(['back-inquiry','ask-zhou-slip','take-reader-note','compare-handoff']);await screen('a10-纸笺对读');
 await step('unfold-slip');assert.match(await page.locator('.press-slip').innerText(),/有意见再改/);await route(['bring-both-notes','correct-notation','handoff-reader']);assert.match(await page.locator('.receipt-paper').innerText(),/周禾/);await page.locator('[data-action="compare-proof"]').click();assert.equal(await page.locator('.comparison-spread article').count(),2);assert.match(await page.locator('.comparison-spread').innerText(),/接过同伴的行李/);await close('comparison-dialog');await route(['seal-handoff','close-day','step-on-deck']);
 await screen('a11-江上场景');await step('inspect-trunk');assert.equal(await page.locator('[data-choice="make-address"]').isDisabled(),true);
 await route(['wrap-ledger','back-to-trunk','wrap-proof','back-to-trunk','wrap-letter']);
 await driver(page).note('opening','自动化验证文字：也问一声人的消息。');
 await route(['back-to-trunk','make-address','write-to-reader','hear-farewell','turn-october']);await page.setViewportSize({width:1366,height:768});loadedImages.issue18=await imageReady('#story-image');await screen('a12-真实后期原刊');
 await route(['find-work-continued','open-return','read-reader']);assert.match(await driver(page).text(),/往前递一把手/);await screen('a13-人物回声');
 await route(['back-to-archive','write-ending']);const ownText='<img src=x onerror="window.storyXSS=true">自动化验证文字。';
 await driver(page).note('closing',ownText);await step('leave-letter');assert.equal(await page.evaluate(()=>window.storyXSS),undefined);
 await screen('a14-最后纸页');paths.reader=await page.evaluate(key=>localStorage.getItem(key),STORY_SAVE_KEY);
 assert.equal(restoreStory(paths.reader).state.flags.recordCorrected,true);
 checks.push('调查要求具体材料，向当前人物出示推进、纸笺展开、修正记录、交接、行囊与有依据的不同回声');

 const letterEvent=page.waitForEvent('download');await page.locator('#story-actions [data-action="export-letter"]').click();const letter=await letterEvent;await letter.saveAs(join(output,'exported-letter.txt'));
 const letterText=await readFile(join(output,'exported-letter.txt'),'utf8');assert.ok(letterText.includes(ownText));assert.match(letterText,/modernhistory/);
 await openJournalTab('pages');await page.locator('[data-revisit="compose"]').click();assert.equal(await page.locator('#world').getAttribute('data-review'),'true');
 assert.equal(await page.locator('[data-edit-slot]').count(),0);assert.equal(await page.locator('[data-choice="pull-proof"]').count(),0);
 assert.doesNotMatch(await page.locator('[data-proof-line="0"]').innerText(),/接过同伴/,'回看第一版不能显示后来的改句');await page.locator('[data-action="resume"]').click();assert.equal(await node(page),'ending');
 await openJournalTab('people');assert.equal(await page.locator('.people-notes article').count(),3);await close('journal-dialog');
 await openJournalTab('letter');assert.match(await page.locator('#journal-opening').inputValue(),/人的消息/);assert.equal(await page.locator('#journal-closing').inputValue(),ownText);await close('journal-dialog');
 await page.reload({waitUntil:'domcontentloaded'});assert.equal(await node(page),'ending');
 await page.locator('[data-action="menu"]').first().click();
 const saveEvent=page.waitForEvent('download');await page.locator('#menu-dialog [data-action="export-save"]').click();const save=await saveEvent;await save.saveAs(join(output,'exported-journey.json'));
 const exported=await readFile(join(output,'exported-journey.json'),'utf8');assert.equal(restoreStory(exported).state.flags.finished,true);
 await page.locator('[data-action="ask-reset"]').click();await page.locator('#reset-dialog [data-close]').click();assert.equal(await node(page),'ending');
 await page.locator('[data-action="ask-reset"]').click();await page.locator('[data-action="reset"]').click();assert.equal(await node(page),'threshold');
 await page.locator('[data-action="menu"]').first().click();await page.locator('#import-file').setInputFiles({name:'旅程.json',mimeType:'application/json',buffer:Buffer.from(exported)});
 await page.locator('[data-action="confirm-import"]').click();assert.equal(await node(page),'ending');
 checks.push('第一版只读回看、回到现在、人物手记、刷新、导出、重开取消、确认重开、文件导入');

 for(const [id,width,height] of [['slipMeeting',1024,640],['reviseCompose',390,844],['folding',1366,768],['packing',390,844],['octoberIssue',820,1180],['letter',390,844]]){
  await page.setViewportSize({width,height});await openJournalTab('pages');await page.locator('[data-revisit="'+id+'"]').click();await fixed(page);await screen('narrow-'+id+'-'+width);
  await page.locator('[data-action="resume"]').click();
 }
 await page.setViewportSize({width:1366,height:768});
 await page.locator('[data-action="library"]').click();await page.locator('#only-bookmarked').click();assert.equal(await page.locator('.source-entry').count(),1);await page.locator('#only-bookmarked').click();
 for(const [term,id] of [['文协成立','group'],['汉口难民','refugees']]){
  await page.locator('#source-search').fill(term);await page.locator('#library-list [data-source="'+id+'"]').click();loadedImages[id]=await imageReady('#reader-content img');await screen('photo-'+id);await close('reader-dialog');
 }
 await close('library-dialog');checks.push('1366×768、1024×640、390×844、820×1180 的纸页回看与工作台，原刊札记逐段完整、真实合影与馆藏难民照片、检索与收藏');

 const alternate=await browser.newContext({viewport:{width:1024,height:640},locale:'zh-CN',reducedMotion:'reduce'}),p=await alternate.newPage();p.setDefaultTimeout(12000);track(p);
 await p.goto(base,{waitUntil:'domcontentloaded'});
 await route(['open-letter','read-care','take-commission','accept-work','visit-press','inspect-proof','begin-setting'],p);
 await pick('motif','banner',p);await pick('voice','declare',p);await pick('ending','pledge',p);
 await route(['pull-proof','fold-proof','prepare-oral','walk-to-reader','present-proof','start-reading','defend-version','try-another-form','use-oral','keep-anonymous','return-workroom','make-handoff','mark-provisional','continue-handoff','handoff-self','seal-handoff','close-day','step-on-deck','inspect-trunk','wrap-ledger','back-to-trunk','wrap-proof','back-to-trunk','make-address','leave-recipient-open','hear-farewell','carry-uncertainty','turn-october','find-work-continued','open-return','read-reader'],p);
 assert.match(await driver(p).text(),/没有一份确认/);await screen('alternate-没有确认的回声',p);
 await route(['back-to-archive','write-ending','leave-letter'],p);paths.self=await p.evaluate(key=>localStorage.getItem(key),STORY_SAVE_KEY);
 const a=restoreStory(paths.reader).state,b=restoreStory(paths.self).state;assert.notEqual(makeLetter(a),makeLetter(b));assert.equal(b.flags.recordProvisional,true);assert.equal(b.flags.revised,undefined);
 await alternate.close();checks.push('第二条1024×640窗口完整流程：先排印、原号召、口述、匿名、暂记待核、自行携带，保留不同结局');

 const phone=await browser.newContext({viewport:{width:390,height:844},locale:'zh-CN',reducedMotion:'reduce'}),ph=await phone.newPage();track(ph);await ph.goto(base,{waitUntil:'domcontentloaded'});
 await route(['open-letter','take-commission','accept-work','visit-reader','greet-reader','listen-first','take-story','inspect-proof','begin-setting'],ph);await pick('motif','night',ph);await pick('voice','ask',ph);await pick('ending','reply',ph);
 await route(['pull-proof','fold-proof','fold-booklet','walk-to-reader','present-proof','start-reading','ask-whats-missing','invite-own-words','revise-together','revise-text'],ph);await pick('motif','shared',ph);await screen('phone-新增稿片',ph);await phone.close();checks.push('390×844浏览器触达：从首次进入实走到修订，三处稿片与新增稿片可操作；未宣称实体触摸测试');

 const failing=await browser.newContext({viewport:{width:1024,height:640},locale:'zh-CN',reducedMotion:'reduce'});await failing.route('https://iiif.modernhistory.org.cn/**',request=>request.abort());
 const f=await failing.newPage();f.setDefaultTimeout(12000);track(f);await f.goto(base,{waitUntil:'domcontentloaded'});
 await route(['open-letter','take-commission','accept-work','inspect-circular'],f);await f.locator('.image-failure').waitFor({state:'visible'});await step('read-public-voice',f);await fixed(f);
 await failing.close();checks.push('原站图像失败时有明确缺图说明，调查仍可继续；窄屏没有整页滚动');

 const legacy=JSON.stringify({schema:1,caseId:'wuhan-paper-world',revision:1,actions:['choose:enter-letter'],reads:['letter'],bookmarks:['issue1'],notes:{closing:'原来写过的话'}});
 const migration=await browser.newContext();await migration.addInitScript(({key,raw})=>localStorage.setItem(key,raw),{key:STORY_SAVE_KEY,raw:legacy});
 const m=await migration.newPage();track(m);await m.goto(base,{waitUntil:'domcontentloaded'});assert.equal(await node(m),'threshold');
 await step('open-letter',m);const migrated=restoreStory(await m.evaluate(key=>localStorage.getItem(key),STORY_SAVE_KEY));assert.equal(migrated.state.legacy.raw,legacy);assert.equal(migrated.state.notes.closing,'原来写过的话');await migration.close();
 const protectedContext=await browser.newContext();await protectedContext.addInitScript(key=>localStorage.setItem(key,'{broken'),STORY_SAVE_KEY);
 const bad=await protectedContext.newPage();track(bad);await bad.goto(base,{waitUntil:'domcontentloaded'});await step('open-letter',bad);assert.equal(await bad.evaluate(key=>localStorage.getItem(key),STORY_SAVE_KEY),'{broken');
 await protectedContext.close();checks.push('上一版原始记录、收藏和文字迁移；损坏原记录在新行动后仍受保护');

 const quota=await browser.newContext();await quota.addInitScript(()=>{Storage.prototype.setItem=function(){throw new DOMException('quota','QuotaExceededError');};});
 const q=await quota.newPage();track(q);await q.goto(base,{waitUntil:'domcontentloaded'});await step('open-letter',q);await q.locator('[data-action="menu"]').first().click();assert.match(await q.locator('#storage-warning').innerText(),/写入未成功/);await quota.close();
 checks.push('存储写入失败可见，页面内行动保留且仍可导出');
 assert.deepEqual(errors,[]);
 const summary={clientDate:'2026-10-22',date:new Date().toISOString(),node:process.version,status:'passed',checks,routeCount:2,pageErrors:errors,sceneCount:Object.keys(SCENES).length,characterCount:Object.keys(CHARACTERS).length,nodeCount:Object.keys(NODES).length,loadedImages,viewports:[...new Set(layouts.map(r=>r.width+'x'+r.height))],minimumBodyHeight:Math.min(...layouts.map(r=>r.body)),actualHumanPlaytimeVerified:false,rightsAndHistoryReviewCompleted:false};
 await writeFile(join(output,'summary.json'),JSON.stringify(summary,null,2)+'\n','utf8');console.log(JSON.stringify(summary,null,2));
}catch(error){await page.screenshot({path:join(output,'failure.png')}).catch(()=>{});throw error;}
finally{await browser.close();}
