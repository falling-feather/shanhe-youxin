import {STORY_ID,STORY_REVISION,NODES,CLUES,DRAFT_OPTIONS,CHARACTERS,responseFor,readerOutcome} from './data/story.mjs';
import {SOURCE_BY_ID} from './data/sources.mjs';

export const STORY_SAVE_KEY='shanhe-paper-story-v1';
export const LEGACY_SAVE_KEY='shanhe-wenxie-1938-v1';
export const MAX_IMPORT_SIZE=4000000;
const MAX_LEGACY_SIZE=1200000;
const MAX_ACTIONS=4096;
const owns=(dict,id)=>typeof id==='string'&&Object.hasOwn(dict,id);
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const unique=values=>[...new Set(values)];
const sourceIds=values=>unique((Array.isArray(values)?values:[]).filter(id=>owns(SOURCE_BY_ID,id)));
const resolve=(value,state)=>typeof value==='function'?value(state):value;

/** 进度以动作重放为准；回看单独保存指针，不允许回到过去改写已经发生的行动。 */
export function createStory(){
 const state={node:'threshold',actions:[],flags:{},draft:{motif:null,voice:null,ending:null},clues:[],visited:['threshold'],memories:{},viewing:null,carried:null,reads:[],bookmarks:[],notes:{opening:'',closing:''},legacy:null,returnNode:null,asideCharacter:null,presented:null,savedAt:null};
 state.memories.threshold=resolvePage(state);
 return state;
}
export function proofFor(state){
 if(state.viewing&&state.memories[state.viewing]?.proof)return [...state.memories[state.viewing].proof];
 return Object.entries(DRAFT_OPTIONS).map(([key,slot])=>slot.options[state.draft[key]]?.text??'（'+slot.label+'：请在纸旁选择稿片）');
}
/** 可核对的现代试样与交接记录；不将仍在编辑的内容称作已取样。 */
export function manuscriptRecord(state){
 const first=state.memories.proofPulled?.proof??[],last=state.memories.revisionRead?.proof??first;
 const outcome=readerOutcome(state),heard=state.visited.includes('readerEcho');
 const responses={unconfirmed:'没有确认下一位接手者',filed:'已登记，仍待联系试读',shared:'接回了读者与同伴的补充',disputed:'已经转交，分歧仍然保留'};
 return {first:[...first],last:[...last],editions:first.length?(state.memories.revisionRead?2:1):0,changed:first.flatMap((line,i)=>line===last[i]?[]:[i]),recipient:state.flags.handoff==='reader'?'周禾':state.flags.handoff==='clerk'?'林青':state.flags.handoff==='self'?'自行携带':'尚未交接',notation:state.flags.recordCorrected?'已依原话修正':state.flags.recordProvisional?'待复核':'尚未核对',credit:state.flags.credit==='named'?'周禾参与试读':state.flags.credit==='anonymous'?'匿名参与说明':'尚未商量',response:heard?responses[outcome]:state.flags.handoff?'等待后续回声':'尚未交接',outcome};
}
function resolvePage(state){
 if(!owns(NODES,state.node))throw new RangeError('未知剧情页');
 const base=NODES[state.node];
 const page={...base,paragraphs:[...(resolve(base.paragraphs,state)??[])],sources:[...(resolve(base.sources,state)??[])],proof:proofFor(state),context:{flags:{...state.flags},draft:{...state.draft}}};
 if(base.aside){
  const origin=NODES[state.returnNode];
  page.act=origin.act;page.scene=origin.scene;page.character=state.asideCharacter;
  page.title='把“'+CLUES[state.presented].title+'”递给'+CHARACTERS[page.character].name;
  page.paragraphs=responseFor(state,page.character,state.presented);
 }
 return page;
}
export function currentPage(state){return state.viewing?state.memories[state.viewing]:resolvePage(state);}
export function choicesFor(state){
 if(state.viewing)return [];
 return (NODES[state.node].choices??[]).filter(choice=>!choice.when||choice.when(state)).map(choice=>{
  const reason=choice.requires?.(state)??'';
  return {...choice,disabled:!!reason,reason};
 });
}
function effects(state,effect){
 if(!effect)return state;
 const flags={...state.flags};
 for(const [key,value] of Object.entries(effect.defaults??{}))if(!Object.hasOwn(flags,key))flags[key]=value;
 Object.assign(flags,effect.flags??{});
 return {...state,flags,clues:unique([...state.clues,...(effect.add??[])])};
}
function enter(state,target){
 if(!owns(NODES,target))throw new RangeError('未知剧情目标');
 let next=effects({...state,node:target,viewing:null,visited:unique([...state.visited,target])},NODES[target].enter);
 const added=next.clues.filter(id=>!state.clues.includes(id));
 if(added.length)next={...next,carried:added.at(-1)};
 next.memories={...state.memories,[target]:resolvePage(next)};
 return next;
}
function record(state,action){
 if(state.actions.length>=MAX_ACTIONS)throw new RangeError('这份旅程已记录很多次行动，请先导出，再开启新旅程。');
 return {...state,actions:[...state.actions,action]};
}
function requirePresent(state){if(state.viewing)throw new RangeError('当前正在回看，先回到现在，再继续行动。');}
export function choose(state,id){
 requirePresent(state);
 const action=choicesFor(state).find(choice=>choice.id===id);
 if(!action)throw new RangeError('眼前没有这个行动，或它需要尚未发生的经历。');
 if(action.disabled)throw new RangeError(action.reason);
 const target=resolve(action.to,state);
 return record(enter(effects({...state,returnNode:null,asideCharacter:null,presented:null},action.effect),target),'choose:'+id);
}
export function editDraft(state,slot,value){
 requirePresent(state);
 if(!NODES[state.node].workbench)throw new RangeError('只有在排印工作台上才可以改动稿片。');
 if(!owns(DRAFT_OPTIONS,slot)||!owns(DRAFT_OPTIONS[slot].options,value))throw new RangeError('未知稿片');
 const entry=DRAFT_OPTIONS[slot].options[value];
 if(entry.when&&!entry.when(state))throw new RangeError('先听取这段意见，并取得试读者的同意，才可以使用这张稿片。');
 const next={...state,draft:{...state.draft,[slot]:value}};
 next.memories={...state.memories,[state.node]:resolvePage(next)};
 return record(next,'edit:'+slot+':'+value);
}
export function presentClue(state,id){
 requirePresent(state);
 if(!owns(CLUES,id)||!state.clues.includes(id))throw new RangeError('尚未找到这条线索，不能凭空出示。');
 const page=currentPage(state),character=page.character;
 if(!character)throw new RangeError('眼前没有可交谈的人。先与场景中的人物开始谈话。');
 const specific=NODES[state.node].presents?.[id];
 if(specific)return record(enter({...state,returnNode:null,asideCharacter:null,presented:null,carried:id},resolve(specific,state)),'present:'+id);
 const origin=state.node==='aside'?state.returnNode:state.node;
 const next=enter({...state,returnNode:origin,asideCharacter:character,presented:id,carried:id},'aside');
 return record(next,'present:'+id);
}
export const canRevisit=(state,id)=>owns(NODES,id)&&state.visited.includes(id)&&!!state.memories[id];
export function revisit(state,id){
 if(!canRevisit(state,id))throw new RangeError('这页尚未发生，不能从手记跳入未来。');
 return record({...state,viewing:id},'revisit:'+id);
}
export function resumeStory(state){return record({...state,viewing:null},'resume:story');}
export function carryClue(state,id){
 if(id!==null&&(!owns(CLUES,id)||!state.clues.includes(id)))throw new RangeError('尚未找到这条线索。');
 return {...state,carried:id};
}
export function readSource(state,id){
 if(!owns(SOURCE_BY_ID,id))throw new RangeError('未知资料');
 return {...state,reads:unique([...state.reads,id])};
}
export function bookmarkSource(state,id){
 if(!owns(SOURCE_BY_ID,id))throw new RangeError('未知资料');
 return {...state,bookmarks:state.bookmarks.includes(id)?state.bookmarks.filter(key=>key!==id):[...state.bookmarks,id]};
}
export function setNote(state,key,value){
 if(!['opening','closing'].includes(key))throw new RangeError('未知书写位置');
 return {...state,notes:{...state.notes,[key]:String(value).slice(0,2000)}};
}
export function relationshipsFor(state){
 return {
  lin:state.flags.recordCorrected?'你们一起改过“可用”那一行，她留下了自己的经手名。':state.flags.carePromise?'她记得你答应回来问一声人的消息。':state.flags.commission?'她托你做试样，也在等接手的消息。':'尚未相遇',
  chen:state.flags.creditedChen?'他的排印工作已被你写进经手记录。':state.flags.heardChen?'你听过他对旧字和改稿的看法。':state.visited.includes('pressHub')?'他在等你带回需要修改的试样。':'尚未相遇',
  zhou:state.flags.permission?'他将铅笔接过去，也约定改后再看。':state.flags.defended?'你们仍有分歧；他希望你再听完一回。':state.flags.listened?'他讲过一段大家共同走完的夜路。':state.visited.includes('readerHub')?'他还在等你说明，想听好话还是实话。':'尚未相遇'
 };
}
export function summaryFor(state){
 const lines=[];
 if(state.flags.firstVisit)lines.push(state.flags.firstVisit==='reader'?(state.flags.listened?'我先到窗边听周禾讲述，再将他的话带到排印桌。':'我先到窗边，再去排印桌做试样。'):'我先到排印桌做试样，后来才面对一个具体读者的回应。');
 if(state.flags.trialDone)lines.push(state.flags.revised?'第一次试读以后，我再次取样并带回去请他看。前一次与意见都没有被丢掉。':'第一次试读提出的分歧还在；它没有因为继续交接便自动消失。');
 if(state.flags.format)lines.push(state.flags.format==='oral'?'我选择先口述，留下文字供人核看。':'我选择把试样折成可以随身展开的小页。');
 if(state.flags.credit)lines.push(state.flags.credit==='named'?'经演绎角色本人同意，留下“周禾参与试读”，不记录私人地址与部队位置。':'留下匿名参与说明，让意见仍可辨认，不替所有人说话。');
 if(state.flags.handoff)lines.push(state.flags.handoff==='reader'?'交给周禾继续试读，约定保留不同意见。':state.flags.handoff==='clerk'?'交林青登记，继续联系试读；收存与实际送达分开记录。':'我自己带走了纸，没有确认下一位接手者。这处空白如实留下。');
 if(state.flags.recordCorrected)lines.push('我沿着经手人找回小笺与保留意见，和林青一起将“可用”改回具体的进度。');
 else if(state.flags.recordProvisional)lines.push('我暂记待复核，将尚未问清的分歧一并交给下一位。');
 if(state.flags.carePromise)lines.push('我也记得答应过，不只追问事情，还要问一声人的消息。');
 if(state.flags.recipient)lines.push(state.flags.recipient==='reader'?'途中，我把那一页想说的话写给周禾。':state.flags.recipient==='clerk'?'途中，我把那一页想说的话写给林青。':'途中，我把那一页想说的话留给后来接起它的人。');
 if(!lines.length)lines.push('纸上的旅程还没有展开，先把问题留在灯下。');
 return lines;
}
export function makeLetter(state){
 const refs=unique([...state.clues.flatMap(id=>CLUES[id].sources),...state.reads]);
 return ['山河有信｜纸上的接力',state.flags.finished?'给后来人的一页':'仍在展开中的手记','',...summaryFor(state),'','我的试样 · 现代创作，非历史原刊',...proofFor({...state,viewing:null}),'','途中想写给人的话',state.notes.opening||'（留白）','','给后来人的回应',state.notes.closing||'（留白）','','资料与来处',...refs.flatMap(id=>{const source=SOURCE_BY_ID[id];return ['['+source.number+'] '+source.title,source.credit,'支持边界：'+source.limit,...source.links.map(link=>link.label+'：'+link.url),''];}),...(state.legacy?['旧版留下的文字',...Object.entries(state.legacy.reflections).map(([key,value])=>key+'：'+value),'']:[]),'林青、陈师傅、周禾及玩家委托、对白、试样与回声均为当代演绎，不冒充史实人物、真实订单或送达回执。原信为研究转引；图与刊物保持各自来源。'].join('\n');
}
export function serializeStory(state){
 return JSON.stringify({schema:1,caseId:STORY_ID,revision:STORY_REVISION,actions:state.actions,carried:state.carried,reads:state.reads,bookmarks:state.bookmarks,notes:state.notes,legacy:state.legacy,savedAt:new Date().toISOString()});
}
function parse(raw,limit=MAX_IMPORT_SIZE){
 if(typeof raw!=='string'||raw.length>limit)return {error:'进度文件过大或内容异常，当前记录未被替换。'};
 let data;try{data=JSON.parse(raw);}catch{return {error:'没有读懂这份进度，请保留原文件。'};}
 return object(data)?{data}:{error:'这不是本作的进度记录。'};
}
export function importLegacy(raw){
 const parsed=parse(raw,MAX_LEGACY_SIZE),fresh=createStory();if(parsed.error)return {ok:false,state:fresh,warning:parsed.error};
 const data=parsed.data,quiz=data.caseId==='wuhan-wenxie-1938'&&[1,2].includes(data.revision),paper=data.caseId===STORY_ID&&data.revision===1;
 if(data.schema!==1||(!quiz&&!paper))return {ok:false,state:fresh,warning:'旧记录不属于可迁移的内容版本，请保留原文件。'};
 const reflections={};
 for(const key of ['city','letter','print','echo','final'])if(typeof data.reflections?.[key]==='string')reflections[key]=data.reflections[key].slice(0,2000);
 if(paper){
  for(const key of ['opening','closing'])if(typeof data.notes?.[key]==='string'){fresh.notes[key]=data.notes[key].slice(0,2000);reflections[key]=fresh.notes[key];}
  for(const key of ['city','letter','print','echo','final'])if(typeof data.legacy?.reflections?.[key]==='string')reflections[key]=data.legacy.reflections[key].slice(0,2000);
 }
 return {ok:true,state:{...fresh,reads:sourceIds(paper?data.reads:data.visited),bookmarks:sourceIds(data.bookmarks),legacy:{raw,reflections}},warning:'已保留旧版原始记录、收藏与个人文字。故事已重构，新的相遇从第一页开始，旧进度不冒充新经历。'};
}
export function restoreStory(raw){
 if(raw===null||raw===undefined||raw==='')return {ok:true,state:createStory(),warning:''};
 const parsed=parse(raw);if(parsed.error)return {ok:false,state:createStory(),warning:parsed.error};
 const data=parsed.data;
 if(data.caseId==='wuhan-wenxie-1938'||data.caseId===STORY_ID&&data.revision===1)return importLegacy(raw);
 if(data.schema!==1||data.caseId!==STORY_ID||data.revision!==STORY_REVISION)return {ok:false,state:createStory(),warning:'进度与这段故事的版本不同，未载入。请保留原文件。'};
 if(!Array.isArray(data.actions))return {ok:false,state:createStory(),warning:'进度缺少行动记录，未载入。'};
 let state=createStory(),recovered=data.actions.length>MAX_ACTIONS;
 for(const action of data.actions.slice(0,MAX_ACTIONS)){
  if(typeof action!=='string'||action.length>160){recovered=true;break;}
  const parts=action.split(':'),[kind,id,value]=parts;
  if(parts.length!==(kind==='edit'?3:2)){recovered=true;break;}
  try{
   if(kind==='choose'&&value===undefined)state=choose(state,id);
   else if(kind==='edit'&&value!==undefined)state=editDraft(state,id,value);
   else if(kind==='present'&&value===undefined)state=presentClue(state,id);
   else if(kind==='revisit'&&value===undefined)state=revisit(state,id);
   else if(kind==='resume'&&id==='story'&&value===undefined)state=resumeStory(state);
   else{recovered=true;break;}
  }catch(error){if(!(error instanceof RangeError))throw error;recovered=true;break;}
 }
 state.reads=sourceIds(data.reads);state.bookmarks=sourceIds(data.bookmarks);
 for(const key of ['opening','closing'])if(typeof data.notes?.[key]==='string')state=setNote(state,key,data.notes[key]);
 if(state.clues.includes(data.carried))state.carried=data.carried;
 if(typeof data.savedAt==='string')state.savedAt=data.savedAt.slice(0,40);
 if(typeof data.legacy?.raw==='string'){
  const migrated=importLegacy(data.legacy.raw);if(migrated.ok)state.legacy=migrated.state.legacy;else recovered=true;
 }
 return {ok:true,state,warning:recovered?'已接回能重放的连续行动。无法核对的后续未当成剧情进度，个人文字仍已保留。':''};
}
