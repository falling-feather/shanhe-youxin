import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {fingerprint} from './build-fingerprint.mjs';
import {createDriver} from '../tests/ui-driver.mjs';
import {STORY_SAVE_KEY,restoreStory} from '../dist/narrative.mjs';

const root=fileURLToPath(new URL('../',import.meta.url)),out=join(root,'output/review-2026-10-22'),raw=join(root,'tmp/round3-qa/video-raw');
await mkdir(out,{recursive:true});await mkdir(raw,{recursive:true});
const build=await fingerprint(root);await writeFile(join(out,'build-manifest.json'),JSON.stringify(build,null,2)+'\n','utf8');
const {chromium}=createRequire(resolve(process.env.SHANHE_PLAYWRIGHT_PACKAGE))('playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.SHANHE_BROWSER_PATH});
const errors=[],clips=[];
async function makePage(name){
 const context=await browser.newContext({viewport:{width:1366,height:768},locale:'zh-CN',reducedMotion:'reduce',recordVideo:{dir:raw,size:{width:1366,height:768}}});
 const page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:4177/',{waitUntil:'domcontentloaded'});
 await page.evaluate(build=>{const caption=document.createElement('div');caption.id='review-caption';Object.assign(caption.style,{position:'fixed',left:'50%',bottom:'12px',transform:'translateX(-50%)',zIndex:'100000',maxWidth:'88vw',width:'max-content',padding:'11px 21px',background:'#241c15ed',color:'#f7e9cf',font:'17px/1.7 "Microsoft YaHei",sans-serif',textAlign:'center',pointerEvents:'none',whiteSpace:'pre-line',boxShadow:'0 3px 16px #0004'});document.body.append(caption);const marker=document.createElement('div');Object.assign(marker.style,{position:'fixed',top:'9px',right:'12px',zIndex:'100000',color:'#f0dfc4',background:'#241c15c9',font:'10px/1.6 sans-serif',padding:'3px 7px',pointerEvents:'none'});marker.textContent='自动化实录节选 · 构建 '+build.slice(0,12);document.body.append(marker);},build.build);
 const d=createDriver(page,{settleVisuals:true});
 async function caption(text,seconds=4){await page.locator('#review-caption').evaluate((el,text)=>{el.textContent=text;},text);await page.waitForTimeout(seconds*1000);}
 async function done(){const state=await page.evaluate(key=>localStorage.getItem(key),STORY_SAVE_KEY);if(!restoreStory(state).state.flags.finished)throw new Error('录制路线未结束：'+name);await writeFile(join(out,'演示存档-'+name+'.json'),state,'utf8');await context.close();clips.push(await page.video().path());}
 return {page,d,caption,done};
}
try{
 const {page,d,caption,done}=await makePage('倾听与接续');
 await caption('山河有信｜红色之旅·追梦铸魂\n真实材料支撑的抗战文化接力；人物与试样明确为演绎。\n以下为自动化操作导览，不是受众测试或真实游玩时长。',7);
 await d.choose('open-letter');await caption('从研究转引的来信进入；摘句标明现代排印，不仿造原信。',5);await d.choose('notice-plan');await d.route(['take-commission','accept-work','inspect-circular']);
 await page.locator('#story-image').evaluate(img=>img.decode());await caption('真实《抗战文艺》原页由原站公开阅览服务加载，资料可回到出处。',6);
 await d.route(['back-office','visit-reader','greet-reader','listen-first']);await caption('读者有自己的经验与保留意见；先倾听，会改变人物记忆和可用稿片。',6);
 await d.route(['take-story','inspect-proof','begin-setting']);await d.pick('motif','night');await caption('三处稿片分步试放，文字即时进入左侧校样。阅读和翻页不改变剧情。',4);await d.pick('voice','ask');await d.pick('ending','reply');
 await d.route(['pull-proof','fold-proof','fold-booklet','walk-to-reader','present-proof','start-reading']);await caption('第一次试读有分歧。这里没有答题分数，人物会回应具体文字。',6);
 await d.route(['ask-whats-missing','invite-own-words','revise-together','revise-text']);await d.pick('motif','shared');await caption('获准使用新稿片后，彼此照应真正写入第二次试样；朱线标出改句。',6);
 await d.route(['pull-revision','bring-revision']);await caption('二次试读回应实际改句，前一版和当时意见仍可只读回看。',5);
 await d.route(['ask-name','name-person','return-workroom','make-handoff']);await caption('“可取样”如何成了“可用”？沿经手者取回小笺与保留意见。',6);
 await d.route(['trace-handoff','ask-chen-slip','take-press-note','ask-zhou-slip','take-reader-note','compare-handoff']);await caption('物件承载调查：展开折住的一行，分清取样、试读与定稿。',4);await d.choose('unfold-slip');await page.waitForTimeout(3000);
 await d.route(['bring-both-notes','correct-notation','handoff-reader']);await caption('交接留下可核对的存根：取样次数、接手人、记录状态与待续事项。',5);await page.locator('[data-action="compare-proof"]').click();await caption('稿件对照取自实际取样快照；不是临时生成两段“看起来不同”的文字。',6);await page.locator('#comparison-dialog .close').click();
 await d.route(['seal-handoff','close-day','step-on-deck','inspect-trunk','wrap-ledger','back-to-trunk','wrap-proof','back-to-trunk','wrap-letter']);await d.note('opening','走到下一处，也记得问候。');
 await d.route(['back-to-trunk','make-address','write-to-reader','hear-farewell','turn-october']);await page.locator('#story-image').evaluate(img=>img.decode());await caption('历史继续由真实后期原刊承接；演绎交接不冒充历史送达证明。',5);
 await d.route(['find-work-continued','open-return','read-reader']);await caption('第一条后果：经倾听与改稿，将试样交读者继续试读，接回补充意见。',7);
 await d.route(['back-to-archive','write-ending']);await d.note('closing','把不同的意见，也交给下一双手。');await d.choose('leave-letter');await caption('以动作重放保存经历；旧文字保留，回看不能重选过去来改写结果。',4);await done();console.log('Recorded route A.');

 const other=await makePage('保留分歧');
 await other.caption('对照路线：保留原稿与分歧、匿名、暂记待复核，由自己携带。\n下段压缩过程，完整操作和复走步骤另有记录。',5);
 await other.d.route(['open-letter','take-commission','accept-work','visit-press','inspect-proof','begin-setting']);await other.d.pick('motif','banner');await other.d.pick('voice','declare');await other.d.pick('ending','pledge');
 await other.d.route(['pull-proof','fold-proof','prepare-oral','walk-to-reader','present-proof','start-reading','defend-version','try-another-form','use-oral','keep-anonymous','return-workroom','make-handoff','mark-provisional','continue-handoff','handoff-self']);await other.caption('同一套规则下，这次只有一次取样，下一位接手者仍未确认。',5);
 await other.d.route(['seal-handoff','close-day','step-on-deck','inspect-trunk','wrap-ledger','back-to-trunk','wrap-proof','back-to-trunk','make-address','leave-recipient-open','hear-farewell','carry-uncertainty','turn-october','find-work-continued','open-return','read-reader']);await other.caption('另一条后果：没有凭空补出“收到”的回信。未知与未完成被如实保留。',7);
 await other.d.route(['back-to-archive','write-ending','leave-letter']);await other.caption('待统筹独立复评；未自证90分或承诺获奖。\nAI参与研究编排、剧本、代码与演绎插画；学生实际贡献须如实确认。\n专业史学审读、正式素材使用范围与真人体验仍待核。录屏无系统音轨。',10);await other.done();console.log('Recorded route B.');
 if(errors.length)throw new Error(errors.join('\n'));
}finally{await browser.close();}
const after=await fingerprint(root);if(after.build!==build.build)throw new Error('录制期间构建发生变化，不能交付为同一构建');
const output=join(out,'山河有信-评审导览.mp4');
const result=spawnSync(process.env.SHANHE_FFMPEG,['-y','-i',clips[0],'-i',clips[1],'-filter_complex','[0:v]fps=30,setsar=1[v0];[1:v]fps=30,setsar=1[v1];[v0][v1]concat=n=2:v=1:a=0[v]','-map','[v]','-an','-c:v','libx264','-threads','2','-preset','veryfast','-crf','21','-pix_fmt','yuv420p','-movflags','+faststart',output],{encoding:'utf8',maxBuffer:2000000,windowsHide:true});
if(result.status!==0)throw new Error(result.stderr.slice(-3000));
await writeFile(join(out,'video-evidence.json'),JSON.stringify({clientDate:'2026-10-22',build:build.build,automated:true,humanResearch:false,edited:'两条完整UI实走的字幕导览；过渡压缩，不作为时长证据',audio:'无系统音轨',file:'山河有信-评审导览.mp4',pageErrors:errors},null,2)+'\n','utf8');
console.log(JSON.stringify({output,build:build.build,status:'recorded-and-encoded'}));
