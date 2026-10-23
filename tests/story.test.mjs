import test from 'node:test';
import assert from 'node:assert/strict';
import { NODES, CLUES, ACTS, CHARACTERS, SCENES } from '../dist/data/story.mjs';
import { SOURCE_BY_ID } from '../dist/data/sources.mjs';
import { createStory, choicesFor, choose, presentClue, currentPage, readSource, bookmarkSource, setNote, editDraft, proofFor, manuscriptRecord, serializeStory, restoreStory, importLegacy, canRevisit, revisit, resumeStory, makeLetter } from '../dist/narrative.mjs';
import { start,toCompose,toTransfer,draft,finish,walk } from './story-paths.mjs';

test('场景、人物、线索和史料引用完整',()=>{
 assert.equal(ACTS.length,5);assert.equal(Object.keys(CHARACTERS).length,3);
 for(const page of Object.values(NODES)){
  assert.ok(page.title&&page.kind&&SCENES[page.scene],page.id);
  if(page.character)assert.ok(CHARACTERS[page.character],page.id);
  if(Array.isArray(page.sources))for(const id of page.sources)assert.ok(Object.hasOwn(SOURCE_BY_ID,id),page.id+'/'+id);
  for(const id of page.enter?.add??[])assert.ok(CLUES[id],page.id+'/'+id);
  for(const action of page.choices??[])if(typeof action.to==='string')assert.ok(NODES[action.to],page.id+'/'+action.id);
 }
 for(const clue of Object.values(CLUES))for(const id of clue.sources)assert.ok(Object.hasOwn(SOURCE_BY_ID,id));
});
test('首访地点被记住；人物会记得玩家先去听谁说话',()=>{
 assert.throws(()=>choose(createStory(),'visit-press'),RangeError);
 const press=walk(start(),['visit-press','greet-printer']);
 const reader=walk(start(),['visit-reader','greet-reader','listen-first','take-story','greet-printer']);
 assert.equal(press.flags.firstVisit,'press');assert.equal(reader.flags.firstVisit,'reader');
 assert.notDeepEqual(currentPage(press).paragraphs,currentPage(reader).paragraphs);
});
test('编排只允许在工作台进行；稿片会实际改变校样，未完成不能取样',()=>{
 assert.throws(()=>editDraft(start(),'motif','night'),/工作台/);
 const s=toCompose(false);assert.throws(()=>choose(s,'pull-proof'),/稿片/);
 const a=draft(s,true),b=draft(s,false);assert.notDeepEqual(proofFor(a),proofFor(b));
 assert.equal(choose(a,'pull-proof').flags.hasProof,true);
 assert.throws(()=>editDraft(s,'__proto__','night'),/未知/);assert.throws(()=>editDraft(s,'motif','constructor'),/未知/);
});
test('读者参与后出现可用的新稿片，修订实际写入彼此照应，不只改版号',()=>{
 const original=toCompose(true);assert.throws(()=>editDraft(original,'motif','shared'),/听取|同意/);
 let s=walk(choose(draft(original,true),'pull-proof'),['fold-proof','fold-booklet','walk-to-reader','present-proof','start-reading','ask-whats-missing','invite-own-words','revise-together','revise-text']);
 s=editDraft(s,'motif','shared');assert.match(proofFor(s)[0],/接过同伴的行李/);
 s=walk(s,['pull-revision','bring-revision']);assert.match(currentPage(s).paragraphs[0],/这回我能接着说/);
});
test('试读回应草稿内容；听取意见与坚持原稿进入不同处境',()=>{
 const trial=night=>walk(choose(draft(toCompose(night),night),'pull-proof'),['fold-proof','fold-booklet','walk-to-reader','present-proof','start-reading']);
 const a=trial(true),b=trial(false);assert.notDeepEqual(currentPage(a).paragraphs,currentPage(b).paragraphs);
 const listened=walk(a,['ask-whats-missing','invite-own-words']),defended=choose(b,'defend-version');
 assert.equal(listened.flags.permission,true);assert.equal(defended.flags.defended,true);
 assert.ok(listened.clues.includes('readerVoice'));assert.notEqual(listened.node,defended.node);
});
test('人物不替未发生的倾听或第二次取样编造记忆',()=>{
 let s=walk(choose(draft(toCompose(false),true),'pull-proof'),['fold-proof','fold-booklet','walk-to-reader','present-proof','start-reading']);
 assert.doesNotMatch(currentPage(s).paragraphs.join(''),/你听进去了/);
 s=finish(false,'clerk');assert.doesNotMatch(currentPage(revisit(s,'handshakeClerk')).paragraphs.join(''),/两张试样/);
 assert.doesNotMatch(currentPage(revisit(s,'travellingNote')).paragraphs.join(''),/两张试样/);
});
test('两条完整路线有不同的人物回声和交接后果',()=>{
 const a=finish(true,'reader'),b=finish(false,'self');
 assert.equal(a.flags.finished,true);assert.equal(b.flags.finished,true);
 assert.equal(a.flags.handoff,'reader');assert.equal(b.flags.handoff,'self');assert.notEqual(makeLetter(a),makeLetter(b));
 assert.notDeepEqual(currentPage(revisit(a,'readerEcho')).paragraphs,currentPage(revisit(b,'readerEcho')).paragraphs);
 assert.match(makeLetter(b),/没有确认/);assert.match(makeLetter(a),/周禾/);
});
test('交接存根只使用实际取样快照，未落墨的编辑不冒充印成的稿件',()=>{
 let s=toCompose(true);assert.equal(manuscriptRecord(s).editions,0);
 s=choose(draft(s,true),'pull-proof');const first=manuscriptRecord(s);
 assert.equal(first.editions,1);assert.equal(first.recipient,'尚未交接');assert.deepEqual(first.changed,[]);
 const a=manuscriptRecord(finish(true,'reader')),b=manuscriptRecord(finish(false,'self'));
 assert.equal(a.editions,2);assert.ok(a.changed.includes(0));assert.equal(a.recipient,'周禾');assert.match(a.response,/补充/);
 assert.equal(b.editions,1);assert.match(b.response,/没有确认/);
 assert.equal(manuscriptRecord(revisit(finish(true,'reader'),'compose')).recipient,'周禾');
});
test('回看只读，不能重新选择旧决定或修改稿片；返回现在不改变进度',()=>{
 const done=finish(true,'reader'),past=revisit(done,'letter');
 assert.equal(past.node,'ending');assert.equal(currentPage(past).id,'letter');assert.equal(choicesFor(past).length,0);
 assert.throws(()=>choose(past,'take-commission'),/回看/);assert.throws(()=>editDraft(past,'motif','banner'),/回看/);
 assert.equal(past.flags.handoff,'reader');assert.equal(resumeStory(past).viewing,null);assert.equal(currentPage(resumeStory(past)).id,'ending');
 assert.equal(canRevisit(createStory(),'ending'),false);assert.throws(()=>revisit(createStory(),'ending'),/尚未/);
});
test('出示线索回应当前人物，空场景不能召唤通用 NPC',()=>{
 const s=walk(start(),['visit-clerk','ask-plan']);assert.ok(s.clues.includes('plan'));
 assert.throws(()=>presentClue(createStory(),'plan'),/尚未/);
 const lin=presentClue(s,'plan');assert.equal(currentPage(lin).character,'lin');assert.match(currentPage(lin).paragraphs.join(''),/拟|筹/);
 assert.equal(choose(lin,'return-to-conversation').node,s.node);
 const chen=walk(start(),['visit-press','inspect-type']),response=presentClue(chen,chen.clues.at(-1));
 assert.equal(currentPage(response).character,'chen');
});
test('经手疑点需要具体小笺与读者意见，出示材料能推动调查而非通用旁谈',()=>{
 let s=choose(toTransfer(),'trace-handoff');assert.throws(()=>choose(s,'compare-handoff'),/小笺/);
 s=walk(s,['ask-chen-slip','take-press-note','ask-lin-slip']);
 s=presentClue(s,'pressMark');assert.equal(s.node,'linNeedsReader');
 s=walk(s,['back-inquiry','ask-zhou-slip','take-reader-note','compare-handoff','unfold-slip','bring-both-notes','correct-notation']);
 assert.equal(s.node,'handoffDesk');assert.equal(s.flags.recordCorrected,true);
 const restored=restoreStory(serializeStory(s));assert.equal(restored.state.flags.recordCorrected,true);
 const provisional=walk(toTransfer(),['mark-provisional','continue-handoff']);
 assert.equal(provisional.flags.recordProvisional,true);assert.equal(provisional.flags.recordCorrected,undefined);
});
test('每个场景都可通过真实行动到达，必要稿片与调查材料不会成为死路',()=>{
 const queue=[createStory()],seen=new Set(),reached=new Set();
 while(queue.length){
  let s=queue.shift();const key=[s.node,!!s.flags.hasProof,s.clues.includes('pressMark'),s.clues.includes('readerReservation'),!!s.flags.packedLedger,!!s.flags.packedProof,s.flags.handoff??''].join(':');
  if(seen.has(key))continue;seen.add(key);reached.add(s.node);
  if(NODES[s.node].workbench)s=draft(s,true);
  for(const action of choicesFor(s))if(!action.disabled)queue.push(choose(s,action.id));
  if(currentPage(s).character)for(const id of s.clues)queue.push(presentClue(s,id));
 }
 assert.ok(seen.size<10000);assert.deepEqual(Object.keys(NODES).filter(id=>!reached.has(id)),[]);
});
test('重放恢复稿片、人物后果和回看，不相信导入的节点和结束标记',()=>{
 const s=setNote(revisit(finish(true,'clerk'),'readerEcho'),'closing','<img src=x onerror=alert(1)>');
 const raw=JSON.parse(serializeStory(s));raw.flags={finished:false};raw.node='threshold';raw.draft={motif:'banner'};
 const result=restoreStory(JSON.stringify(raw));assert.equal(result.ok,true);assert.equal(result.state.node,s.node);
 assert.deepEqual(result.state.flags,s.flags);assert.deepEqual(result.state.draft,s.draft);assert.equal(result.state.viewing,'readerEcho');
 assert.equal(result.state.notes.closing,s.notes.closing);
 raw.actions.push('choose:invented');const partial=restoreStory(JSON.stringify(raw));assert.ok(partial.warning);assert.equal(partial.state.node,s.node);
});
test('两代旧记录保留原始内容、收藏和文字，不伪造新剧情完成',()=>{
 const v1=JSON.stringify({schema:1,caseId:'wuhan-paper-world',revision:1,actions:['choose:enter-letter'],reads:['letter','constructor'],bookmarks:['issue1'],notes:{opening:'旧开场',closing:'旧回信'}});
 const result=restoreStory(v1);assert.equal(result.ok,true);assert.equal(result.state.node,'threshold');assert.equal(result.state.actions.length,0);
 assert.equal(result.state.notes.closing,'旧回信');assert.equal(result.state.legacy.raw,v1);assert.deepEqual(result.state.reads,['letter']);
 assert.equal(restoreStory(serializeStory(result.state)).state.legacy.raw,v1);
 const old=JSON.stringify({schema:1,caseId:'wuhan-wenxie-1938',revision:2,visited:['letter'],reflections:{city:'旧城市文字'}});
 assert.equal(importLegacy(old).state.legacy.reflections.city,'旧城市文字');
});
test('资料操作不等于剧情进展，内容长度和未知标识有边界',()=>{
 let s=bookmarkSource(readSource(createStory(),'letter'),'issue1');assert.equal(s.actions.length,0);assert.equal(s.node,'threshold');
 assert.throws(()=>readSource(s,'constructor'),/未知/);assert.throws(()=>bookmarkSource(s,'__proto__'),/未知/);
 s=setNote(s,'closing','a'.repeat(3000));assert.equal(s.notes.closing.length,2000);
 assert.equal(restoreStory('{bad').ok,false);assert.equal(restoreStory('x'.repeat(4000001)).ok,false);
 const raw=JSON.parse(serializeStory(s));raw.revision=999;assert.equal(restoreStory(JSON.stringify(raw)).ok,false);
});
test('边界内旧原始记录可随新旅程再次导入；多余动作字段不被悄悄接受',()=>{
 const raw=JSON.stringify({schema:1,caseId:'wuhan-paper-world',revision:1,actions:[],notes:{closing:'原字保留'},padding:'\\"'.repeat(200000)});
 const old=restoreStory(raw);assert.equal(old.ok,true);assert.equal(restoreStory(serializeStory(old.state)).state.legacy.raw,raw);
 const s=toCompose(),forged=JSON.parse(serializeStory(s));forged.actions.push('edit:motif:night:extra');
 const result=restoreStory(JSON.stringify(forged));assert.ok(result.warning);assert.equal(result.state.draft.motif,null);
});
