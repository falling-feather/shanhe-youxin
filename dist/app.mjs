import {ACTS,NODES,CLUES,SCENES,CHARACTERS,DRAFT_OPTIONS} from './data/story.mjs';
import {SOURCES,SOURCE_BY_ID} from './data/sources.mjs';
import {createStory,choicesFor,choose,presentClue,currentPage,carryClue,readSource,bookmarkSource,setNote,editDraft,proofFor,relationshipsFor,summaryFor,makeLetter,revisit,resumeStory,restoreStory,serializeStory,STORY_SAVE_KEY,LEGACY_SAVE_KEY,MAX_IMPORT_SIZE} from './narrative.mjs';
import {esc,materialMarkup,sourceButtons} from './renderers.mjs';
import {mountAtlas} from './atlas.mjs';
import {createSoundscape} from './soundscape.mjs';
import {syncIllustration} from './illustration.mjs';
import {mountPaperPager} from './pagination.mjs';
import {storyBlocks,blockMarkup,proofMarkup as paperProof,receiptMarkup,comparisonMarkup,fitProofPagers} from './paper-ui.mjs';

const $=selector=>document.querySelector(selector);
let rawSave=null,rawLegacy=null,storageAvailable=true,warning='',pendingImport=null;
try{rawSave=localStorage.getItem(STORY_SAVE_KEY);rawLegacy=localStorage.getItem(LEGACY_SAVE_KEY);}catch{storageAvailable=false;warning='浏览器未允许本机存档。刷新前可导出旅程，带走当前记录。';}
const loaded=restoreStory(rawSave??rawLegacy);
let state=loaded.state;warning||=loaded.warning;
let invalidRaw=loaded.ok?null:rawSave,saveProtected=!loaded.ok&&rawSave!==null;
let readerSource=null,readerUI={},journalTab='clues',selectedClue=state.carried,onlyBookmarked=false,stageAtlas=null,modalAtlas=null,whisperTimer=null,flipped=false,largeFont=false,lastScene=null;
const sound=createSoundscape(),mapView={};
let mainBlocks=[],mainPager=null,mainLayoutKey='',pendingReadingBookmark=null,layoutFrame=null,editorSlot='motif',lastEditorNode=null,extraChoices=[];
const announce=text=>{$('#announcer').textContent=text;};
function whisper(text){clearTimeout(whisperTimer);$('#ink-whisper').textContent=text;$('#ink-whisper').hidden=false;whisperTimer=setTimeout(()=>$('#ink-whisper').hidden=true,6500);announce(text);}
function persist(){
 state={...state,savedAt:new Date().toISOString()};
 if(storageAvailable&&!saveProtected){try{localStorage.setItem(STORY_SAVE_KEY,serializeStory(state));}catch{storageAvailable=false;warning='本机写入未成功，当前页面的旅程仍在。刷新前请导出。';}}
 renderSave();
}
function renderSave(){
 $('#save-status').textContent=saveProtected?'未载入的原记录保持原样。这页的新行动请先导出，或明确导入／重开后采用新旅程。':storageAvailable?'旅程、试样和个人文字保存在当前浏览器本机。':'这次旅程暂时只在当前页面，请导出后再离开。';
 $('#storage-warning').textContent=warning;$('#storage-warning').hidden=!warning;
 $('#export-old').hidden=!state.legacy&&!rawLegacy;$('#export-raw').hidden=!invalidRaw;
 $('#local-status').textContent=saveProtected?'原记录受保护':storageAvailable?'本机存档':'请导出保存';
}
function showDialog(id){const dialog=$(id);if(!dialog.open)dialog.showModal();}
function closeDialogs(){for(const dialog of document.querySelectorAll('dialog[open]'))dialog.close();}
function safeStory(operation){
 const before=state.clues;
 try{state=operation(state);}catch(error){if(!(error instanceof RangeError))throw error;whisper(error.message);return;}
 flipped=false;persist();render();
 const added=state.clues.filter(id=>!before.includes(id));
 if(added.length)whisper('页边留下了：'+CLUES[added.at(-1)].title);
 $('#scene-title').focus({preventScroll:true});
}
function actionMarkup(action,extraClass=''){
 return `<button class="story-choice ${extraClass}" type="button" data-choice="${action.id}"${action.disabled?' disabled':''}>${esc(action.label)}${action.reason?`<small>${esc(action.reason)}</small>`:''}</button>`;
}
function proofMarkup(options={}){return paperProof(state,{...options,flipped});}
function renderWorkbench(){
 const keys=Object.keys(DRAFT_OPTIONS),slot=DRAFT_OPTIONS[editorSlot],index=keys.indexOf(editorSlot);
 $('#stage').innerHTML='<div class="workbench">'+proofMarkup({editable:true})+'<section class="draft-pieces" aria-label="分步编排稿片"><header><p class="workspace-note">把稿片放进纸里</p><div class="editor-tabs" role="group" aria-label="三处稿片">'+keys.map((key,i)=>'<button type="button" data-edit-tab="'+key+'" aria-pressed="'+(key===editorSlot)+'">'+(i+1)+' '+DRAFT_OPTIONS[key].short+(state.draft[key]?' ✓':'')+'</button>').join('')+'</div></header><fieldset><legend>'+slot.label+'</legend>'+Object.entries(slot.options).filter(([,entry])=>!entry.when||entry.when(state)).map(([value,entry])=>'<button type="button" class="draft-piece" data-edit-slot="'+editorSlot+'" data-edit-value="'+value+'" aria-pressed="'+(state.draft[editorSlot]===value)+'">'+esc(entry.title)+'<span'+(state.draft[editorSlot]===value?'':' hidden')+'>'+esc(entry.text)+'</span></button>').join('')+'</fieldset><footer><button type="button" data-edit-tab="'+keys[Math.max(0,index-1)]+'"'+(index===0?' disabled':'')+'>← 上一处</button><span>第 '+(index+1)+' / 3 处</span><button type="button" data-edit-tab="'+keys[Math.min(2,index+1)]+'"'+(index===2?' disabled':'')+'>下一处 →</button></footer></section></div>';
 requestLayout();
}

function documentMarkup(page){
 const source=SOURCE_BY_ID[page.artifact];if(!source)return '';
 const image=source.pages?.[page.imagePage??0]?.url??source.image;
 return `<figure class="stage-document"><button class="document-expand" type="button" data-source="${source.id}" aria-label="展开${esc(source.title)}原页"><img id="story-image" src="${esc(image)}" alt="${esc(source.title)}，${esc(source.date)}" decoding="async"><span class="image-wait">正在从原站展开…</span><span class="image-failure" hidden>原页暂未加载<br><small>仍可展开札记与出处。故事可以继续。</small></span><span class="document-hint">点原页，展开阅览 ↗</span></button><figcaption>${esc(source.title)}<small>${esc(source.date)} · ${esc(source.credit)}</small></figcaption></figure>`;
}
function renderStage(page,actions){
 if(page.kind==='compose'&&!state.viewing&&page.id!==lastEditorNode){editorSlot='motif';lastEditorNode=page.id;}
 stageAtlas?.dispose();stageAtlas=null;$('#stage').innerHTML='';
 if(page.kind==='record'||page.kind==='ending')$('#stage').innerHTML=receiptMarkup(state);
 else if(page.kind==='compose'&&!state.viewing)renderWorkbench();
 else if(page.kind==='proof'||page.kind==='compose'||state.viewing&&page.kind==='fold')$('#stage').innerHTML=proofMarkup();
 else if(page.kind==='fold'){
  const fold=actions.find(action=>action.id==='fold-booklet');
  $('#stage').innerHTML=`<div class="fold-work"><button class="fold-paper" type="button" data-choice="${fold.id}" aria-label="沿折痕折成随身页"><span class="fold-face"><small>一页试样 · 当代创作</small><strong>在路上</strong><span>${esc(proofFor(state)[0])}</span></span><span class="fold-wing" aria-hidden="true"></span><i>沿折痕合起 ↗</i></button></div>`;
 }else if(page.kind==='packing'){
  const labels={'wrap-ledger':['工作抄页','接手与未完的事','packedLedger'],'wrap-proof':['你的试样','折痕与修改留下来','packedProof'],'wrap-letter':['给家里的一页','有一句还想说的话','packedLetter']};
  const items=state.viewing?page.choices:actions,flags=state.viewing?page.context.flags:state.flags;
  $('#stage').innerHTML=`<div class="packing-table">${items.filter(action=>Object.hasOwn(labels,action.id)).map((action,i)=>{const [title,sub,flag]=labels[action.id];return `<button type="button" class="pack-paper paper-${i}" data-choice="${action.id}" aria-label="${esc(action.label)}" data-packed="${!!flags[flag]}"${state.viewing?' disabled':''}><small>${flags[flag]?'已收入布包 · 可再看':'翻看，再收妥'}</small><strong>${title}</strong><span>${sub}</span><i aria-hidden="true"></i></button>`;}).join('')}<span class="cloth-line" aria-hidden="true"></span></div>`;
 }else if(page.kind==='handoff')$('#stage').innerHTML=`<div class="handoff-paper"><span class="proof-eyebrow">演绎物件 · 交接笺</span><h2>不是一个“已办”</h2><dl><dt>这一页</dt><dd>${esc(state.flags.format==='oral'?'口述与核看文字':'随身折页')}</dd><dt>经手的人</dt><dd>你、陈师傅、周禾</dd><dt>接手的人</dt><dd class="blank-line">等你写下</dd><dt>还要继续</dt><dd>让不同的意见，也有地方回来</dd></dl></div>`;
 else if(page.kind==='slip'){
  if(page.slip==='ledger')$('#stage').innerHTML='<article class="transfer-paper"><small>演绎交接笺</small><h2>试读记录</h2><p>已送样</p><p>已试读</p><p class="circled-word">可用</p><span>接手人：<i></i></span><footer>谁曾这样说过？</footer></article>';
  else $('#stage').innerHTML=`<div class="slip-set" data-fold="${page.slip}"><article class="reader-slip"><small>演绎物件 · 周禾的保留意见</small><h2>愿意再读</h2><p>有些话还没有放进去。<br>改后，希望再看一遍。</p></article><article class="press-slip"><small>演绎物件 · 随样小笺</small><h2>可取样</h2><p>${page.slip==='unfolded'?'送试读，有意见再改。':'末尾一行，折在了里面。'}</p>${page.slip==='folded'?`<button type="button" data-choice="unfold-slip" class="unfold-note"${state.viewing?' disabled':''}><span>把折住的一行展开 ↗</span></button>`:'<span class="unfolded-crease" aria-hidden="true"></span>'}</article></div>`;
 }
 else if(page.kind==='map')stageAtlas=mountAtlas($('#stage'),{view:mapView});
 else if(page.artifact)$('#stage').innerHTML=documentMarkup(page);
 if(page.kind==='compare'&&page.id==='comparison')$('#stage').insertAdjacentHTML('beforeend','<aside class="comparison-slip"><small>原信转引 · 现代排印</small><p>为兵士写读物，事在必办。</p><span>信中的筹画，与刊物留下的工作，并排阅读。</span></aside>');
}
function renderActions(page){
 if(state.viewing){$('#story-actions').innerHTML='<button class="story-choice" type="button" data-action="resume">回到现在，继续旅程 →</button>';return;}
 let actions=choicesFor(state);
 if(page.kind==='scene')actions=actions.filter(action=>!action.spot);
 if(page.quotes)actions=actions.filter(action=>!page.quotes.some(quote=>quote.choice===action.id));
 if(page.kind==='packing')actions=actions.filter(action=>!action.id.startsWith('wrap-'));
 if(page.kind==='fold')actions=actions.filter(action=>action.id!=='fold-booklet');
 if(page.kind==='slip'&&page.slip==='folded')actions=actions.filter(action=>action.id!=='unfold-slip');
 extraChoices=actions.length>2?actions.slice(1):[];
 const visible=extraChoices.length?actions.slice(0,1):actions;
 $('#story-actions').innerHTML=visible.map(action=>actionMarkup(action)).join('')+(extraChoices.length?'<button type="button" class="story-choice secondary-actions" data-action="more-actions">其他 '+extraChoices.length+' 种行动 ↗</button>':'');
 if(page.kind==='ending')$('#story-actions').innerHTML=actions.map(action=>actionMarkup(action)).join('')+'<button class="story-choice" type="button" data-action="export-letter">带走我的纸页与来处 ↓</button>';
}
function renderReading(page,{preserveReading=false}={}){
 const bookmark=preserveReading?(mainPager?.bookmark??pendingReadingBookmark):null;
 mainBlocks=storyBlocks(page,state);mainPager?.dispose();mainPager=null;mainLayoutKey='';pendingReadingBookmark=bookmark;
 $('#page-content').innerHTML=mainBlocks.map(blockMarkup).join('');requestLayout();
}
function renderCarried(page){
 const carried=state.carried&&CLUES[state.carried];$('#carried-bar').hidden=!carried||page.kind==='cover';
 $('#carried-line').innerHTML=carried?'<small>手边</small>'+esc(carried.title)+' <span>↗</span>':'';
 $('#present-carried').hidden=!carried||!page.character||!!state.viewing;
 $('#present-carried').textContent=page.character?'递给'+CHARACTERS[page.character].name+' →':'';
}
function render(){
 const page=currentPage(state),scene=SCENES[page.scene],world=$('#world'),actions=choicesFor(state);
 world.dataset.kind=page.kind;world.dataset.scene=page.scene;world.dataset.node=page.id;world.dataset.act=page.act;world.dataset.tone=scene.tone;world.dataset.review=String(!!state.viewing);
 if(lastScene!==page.scene){
  syncIllustration($('#scene-background'),scene.image,()=>{$('#place-label').textContent='场景插画未载入 · '+scene.place;});lastScene=page.scene;world.classList.remove('scene-changing');void world.offsetWidth;world.classList.add('scene-changing');sound.setScene(scene.sound);
 }
 $('#act-label').textContent=String(page.act).padStart(2,'0')+' / '+ACTS[page.act-1].title;
 $('#place-label').textContent=scene.place;
 $('#scene-kicker').textContent=state.viewing?'手记回看 · 此处不能改选':page.kicker??(page.character?CHARACTERS[page.character].role+' · 人物对白为演绎':page.kind==='scene'?'走进场景，选择行动':ACTS[page.act-1].subtitle);
 $('#scene-title').textContent=page.title;$('#scene-subtitle').textContent=page.subtitle??'';$('#scene-subtitle').hidden=!page.subtitle;
 $('#speaker').textContent=page.character?CHARACTERS[page.character].name:'';$('#speaker').hidden=!page.character;
 const portrait=page.character&&['dialogue','detail'].includes(page.kind);
 $('#portrait').hidden=!portrait;
 if(portrait){const person=CHARACTERS[page.character],image=$('#character-image');if(image.dataset.person!==page.character){image.dataset.person=page.character;syncIllustration(image,person.image,()=>{$('#character-caption').textContent=person.name+' · 虚构人物 · 插画未载入';});}image.alt=person.name+'，'+person.role+'，虚构角色插画';$('#character-caption').textContent=person.name+' / '+person.role+' · 虚构';}
 renderReading(page);

 renderStage(page,actions);renderActions(page);
 $('#hotspots').innerHTML=state.viewing?'':actions.filter(action=>action.spot).map((action,i)=>`<button class="scene-spot" type="button" data-choice="${action.id}" style="--spot-x:${action.spot.x}%;--spot-y:${action.spot.y}%;--mobile-x:${i%2?73:27}%;--mobile-y:${24+Math.floor(i/2)*14}%"><i aria-hidden="true"></i><span>${esc(action.label)}</span></button>`).join('');
 renderCarried(page);
 $('#hint-button').hidden=!page.hint;$('#hint-button').dataset.hint=page.hint??'';
 $('#scene-sources').innerHTML='<span>场景重构 · '+(page.character?'虚构人物':'文献入戏')+'</span>'+page.sources.map(id=>`<button type="button" data-source="${id}" aria-label="这页来处：${esc(SOURCE_BY_ID[id].short)}">${SOURCE_BY_ID[id].number}</button>`).join('');
 $('#page-scroll').scrollTop=0;
 $('#paper-copy').classList.remove('page-arriving');void $('#paper-copy').offsetWidth;$('#paper-copy').classList.add('page-arriving');
 armImages();requestAnimationFrame(updatePaper);renderSave();announce(ACTS[page.act-1].title+'，'+page.title);
}
function requestLayout(){if(layoutFrame!==null)return;layoutFrame=requestAnimationFrame(()=>{layoutFrame=null;updatePaper();});}
function updatePaper(){
 const viewport=$('#page-scroll'),content=$('#page-content'),key=[viewport.clientWidth,viewport.clientHeight,largeFont,state.node,state.viewing].join(':');
 if(viewport.clientWidth<10||viewport.clientHeight<20)return;
 if(key!==mainLayoutKey){const bookmark=mainPager?.bookmark??pendingReadingBookmark;mainPager?.dispose();mainPager=mountPaperPager({content,viewport,nav:$('#paper-pagination'),blocks:mainBlocks,renderBlock:blockMarkup,initialBookmark:bookmark,label:'正文'});pendingReadingBookmark=null;mainLayoutKey=key;}
 fitProofPagers($('#stage'));
}

function imageState(img,failed=false){
 const owner=img.parentElement,wait=owner?.querySelector('.image-wait'),fallback=owner?.querySelector('.image-failure');
 if(wait)wait.hidden=true;if(fallback){fallback.hidden=!failed;img.hidden=failed;}
 requestAnimationFrame(updatePaper);
}
function armImages(root=document){for(const img of root.querySelectorAll('img'))if(img.complete)imageState(img,!img.naturalWidth);}
document.addEventListener('load',event=>{if(event.target instanceof HTMLImageElement)imageState(event.target);},true);
document.addEventListener('error',event=>{if(event.target instanceof HTMLImageElement)imageState(event.target,true);},true);

function renderReader(){
 const source=SOURCE_BY_ID[readerSource];if(!source)return;
 const ui=readerUI[source.id]??={tab:source.image?'image':'notes',page:0,zoom:false};
 $('#reader-title').textContent=source.title;$('#reader-content').innerHTML=materialMarkup(source,ui,'reader',state.bookmarks.includes(source.id));armImages($('#reader-content'));
}
function openSource(id){if(!Object.hasOwn(SOURCE_BY_ID,id))return;readerSource=id;state=readSource(state,id);persist();renderReader();showDialog('#reader-dialog');}
function openMap(){showDialog('#map-dialog');modalAtlas?.dispose();modalAtlas=mountAtlas($('#map-surface'),{view:{}});state=readSource(state,'atlas');persist();}
$('#map-dialog').addEventListener('close',()=>{modalAtlas?.dispose();modalAtlas=null;});
function renderLibrary(){
 const term=$('#source-search').value.trim().toLocaleLowerCase();
 const list=SOURCES.filter(source=>(!onlyBookmarked||state.bookmarks.includes(source.id))&&(!term||[source.title,source.credit,...source.facts.flat()].join(' ').toLocaleLowerCase().includes(term)));
 $('#only-bookmarked').setAttribute('aria-pressed',String(onlyBookmarked));
 $('#library-list').innerHTML=list.map(source=>`<button class="source-entry" type="button" data-source="${source.id}"><b>${source.number}</b><span><strong>${esc(source.title)}</strong><small>${esc(source.date)} · ${esc(source.kind)}${state.bookmarks.includes(source.id)?' · 已收藏':''}</small></span><i>↗</i></button>`).join('')||'<p class="empty-note">暂时没有匹配的纸页。换个词，或看看全部来处。</p>';
}
function renderJournal(){
 $('#legacy-tab').hidden=!state.legacy;
 for(const button of document.querySelectorAll('[data-journal-tab]')){button.setAttribute('aria-selected',String(button.dataset.journalTab===journalTab));button.tabIndex=button.dataset.journalTab===journalTab?0:-1;}
 const root=$('#journal-content');
 if(journalTab==='clues'){
  if(!state.clues.length){root.innerHTML='<p class="empty-note">还没有拾起线索。先展开信，走进那张共同工作的桌。</p>';return;}
  const id=state.clues.includes(selectedClue)?selectedClue:state.carried??state.clues.at(-1),clue=CLUES[id];selectedClue=id;
  const person=!state.viewing&&currentPage(state).character;
  root.innerHTML=`<div class="notebook-spread"><div class="clue-index">${state.clues.map(key=>`<button type="button" data-pick-clue="${key}" aria-pressed="${key===id}">${esc(CLUES[key].title)}<small>${esc(CLUES[key].label)}</small></button>`).join('')}</div><article class="clue-detail"><p class="eyebrow">${esc(clue.label)}</p><h3>${esc(clue.title)}</h3><p>${esc(clue.summary)}</p><div class="notebook-sources">${sourceButtons(clue.sources)}</div><div class="save-actions"><button class="ink-link strong" type="button" data-carry="${id}">拿在手边 →</button>${person?`<button class="ink-link" type="button" data-present="${id}">递给${CHARACTERS[person].name} →</button>`:'<p class="small-note">与场景中的人物开始谈话后，可将线索出示给对方。</p>'}</div></article></div>`;
 }else if(journalTab==='people'){
  const relations=relationshipsFor(state);
  root.innerHTML=`<div class="people-notes">${Object.entries(CHARACTERS).map(([id,person])=>`<article><img src="${person.image}" alt="${person.name}，虚构人物插画"><div><p class="eyebrow">${person.role} · 虚构</p><h3>${person.name}</h3><p>${person.intro}</p><p class="relationship">${relations[id]}</p></div></article>`).join('')}</div>`;
 }else if(journalTab==='pages'){
  root.innerHTML='<p class="small-note">回看已发生的经历，不改写当时的决定。可随时回到现在。</p>'+ACTS.map(act=>{const ids=state.visited.filter(id=>state.memories[id].act===act.id&&id!=='aside');return ids.length?`<section class="visited-act"><h3>〇${act.id} · ${act.title}</h3>${ids.map(id=>`<button type="button" data-revisit="${id}">${esc(state.memories[id].title)} <span>↗</span></button>`).join('')}</section>`:'';}).join('');
 }else if(journalTab==='letter'){
  root.innerHTML=`<article class="letter-preview"><p class="eyebrow">${state.flags.finished?'给后来人的纸页':'尚在继续的手记'}</p>${summaryFor(state).map(text=>`<p>${esc(text)}</p>`).join('')}<label class="paper-input-label" for="journal-closing">我的回应 · 本机保存</label><textarea id="journal-closing" class="paper-input" data-note="closing" maxlength="2000" rows="4">${esc(state.notes.closing)}</textarea><p class="small-note">当代创作与资料来处随导出的纸页一同带走。</p></article>`;
  root.querySelector('[for="journal-closing"]').insertAdjacentHTML('beforebegin',`<label class="paper-input-label" for="journal-opening">途中想写给人的话 · 本机保存</label><textarea id="journal-opening" class="paper-input" data-note="opening" maxlength="2000" rows="3">${esc(state.notes.opening)}</textarea>`);
 }else{
  const names={city:'河流之间',letter:'尺素之间',print:'纸墨之间',echo:'去留之间',final:'最后的回声',opening:'旧版开场',closing:'旧版回信'};
  root.innerHTML=state.legacy?'<p class="small-note">旧版文字保留原意，不替换成新剧情完成记录。</p>'+Object.entries(state.legacy.reflections).map(([key,value])=>`<section class="legacy-note"><h3>${names[key]??key}</h3><p>${esc(value)}</p></section>`).join(''):'<p class="empty-note">没有迁入的旧版文字。</p>';
 }
 armImages(root);
}
function exportFile(text,type,name){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
const actions={
 'more-actions'(){$('#extra-actions').innerHTML=extraChoices.map(action=>actionMarkup(action)).join('');showDialog('#actions-dialog');},
 'compare-proof'(){$('#comparison-content').innerHTML=comparisonMarkup(state);showDialog('#comparison-dialog');},
 menu(){renderSave();showDialog('#menu-dialog');},journal(){renderJournal();showDialog('#journal-dialog');},library(){renderLibrary();showDialog('#library-dialog');},
 resume(){safeStory(resumeStory);},
 'present-carried'(){if(state.carried)safeStory(s=>presentClue(s,s.carried));},
 'flip-proof'(){flipped=!flipped;const proof=$('.proof-sheet');if(proof)proof.outerHTML=proofMarkup();requestLayout();},

 hint(){whisper($('#hint-button').dataset.hint);},
 'filter-bookmarks'(){onlyBookmarked=!onlyBookmarked;renderLibrary();},
 async sound(){try{const enabled=await sound.toggle();$('#sound-toggle').textContent=enabled?'声音 · 开':'声音 · 关';$('#sound-toggle').setAttribute('aria-pressed',String(enabled));}catch(error){whisper(error.message);}},
 font(){largeFont=!largeFont;document.documentElement.dataset.font=largeFont?'large':'normal';$('#font-toggle').setAttribute('aria-pressed',String(largeFont));requestAnimationFrame(updatePaper);},
 async fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{whisper('浏览器未进入全屏，当前窗口仍可继续。');}},
 'export-letter'(){exportFile('\uFEFF'+makeLetter(state),'text/plain;charset=utf-8','山河有信-我的纸页与来处.txt');whisper('纸页已交给浏览器下载。');},
 'export-save'(){exportFile(serializeStory(state),'application/json;charset=utf-8','山河有信-纸上旅程.json');whisper('旅程已交给浏览器下载。');},
 'export-legacy'(){const raw=state.legacy?.raw??rawLegacy;if(raw)exportFile(raw,'application/json;charset=utf-8','山河有信-旧版原始记录.json');},
 'export-raw'(){if(invalidRaw)exportFile(invalidRaw,'text/plain;charset=utf-8','山河有信-未载入原记录.txt');},
 'import-save'(){$('#import-file').click();},
 'confirm-import'(){if(!pendingImport)return;state=pendingImport.state;warning=pendingImport.warning;pendingImport=null;saveProtected=false;invalidRaw=null;closeDialogs();selectedClue=state.carried;persist();render();whisper('已接上导入的旅程。');},
 'ask-reset'(){$('#reset-dialog>p').textContent=saveProtected?'将采用新旅程替换未载入的原记录。请先导出原记录，再决定重开。':'将重置剧情、试样和新写的文字；收藏、资料阅读和旧版原始内容保留。可先导出这次旅程。';showDialog('#reset-dialog');},
 reset(){const previous=state;state={...createStory(),legacy:previous.legacy,bookmarks:previous.bookmarks,reads:previous.reads};warning='';saveProtected=false;invalidRaw=null;selectedClue=null;closeDialogs();persist();render();}
};
document.addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button||button.disabled)return;
 if(button.hasAttribute('data-close')){button.closest('dialog').close();return;}
 if(button.dataset.editTab){editorSlot=button.dataset.editTab;renderWorkbench();return;}
 if(button.dataset.writeNote){const key=button.dataset.writeNote;$('#writing-title').textContent=key==='opening'?'途中想写给人的话':'留给后来人的一页';$('#writing-text').dataset.note=key;$('#writing-text').value=state.notes[key];showDialog('#writing-dialog');return;}
 if(button.dataset.editSlot){
  try{state=editDraft(state,button.dataset.editSlot,button.dataset.editValue);}catch(error){if(!(error instanceof RangeError))throw error;whisper(error.message);return;}
  const slot=button.dataset.editSlot,value=button.dataset.editValue;persist();renderWorkbench();renderActions(currentPage(state));$(`[data-edit-slot="${slot}"][data-edit-value="${value}"]`)?.focus({preventScroll:true});announce('稿片已换入纸中。');return;
 }
 if(button.dataset.choice){if(button.closest('#actions-dialog'))$('#actions-dialog').close();safeStory(s=>choose(s,button.dataset.choice));return;}
 if(button.dataset.action){actions[button.dataset.action]?.();return;}
 if(button.dataset.source){openSource(button.dataset.source);return;}
 if(button.hasAttribute('data-map-source')){openSource('atlas');return;}
 if(button.dataset.journalTab){journalTab=button.dataset.journalTab;renderJournal();return;}
 if(button.dataset.pickClue){selectedClue=button.dataset.pickClue;renderJournal();return;}
 if(button.dataset.carry){state=carryClue(state,button.dataset.carry);persist();closeDialogs();const page=currentPage(state);renderCarried(page);renderReading(page,{preserveReading:true});whisper('手边拿着：'+CLUES[state.carried].title);return;}
 if(button.dataset.present){closeDialogs();safeStory(s=>presentClue(s,button.dataset.present));return;}
 if(button.dataset.revisit){closeDialogs();safeStory(s=>revisit(s,button.dataset.revisit));return;}
 if(button.dataset.bookmark){state=bookmarkSource(state,button.dataset.bookmark);persist();button.textContent=state.bookmarks.includes(button.dataset.bookmark)?'已收藏 · 取消收藏':'收入资料收藏';if($('#library-dialog').open)renderLibrary();return;}
 const material=button.closest('[data-material-id]');
 if(material){
  const ui=readerUI[material.dataset.materialId],source=SOURCE_BY_ID[material.dataset.materialId];
  if(button.dataset.materialTab){ui.tab=button.dataset.materialTab;ui.notePage=0;renderReader();$(`[role="tab"][data-material-tab="${ui.tab}"]`)?.focus({preventScroll:true});}
  if(button.hasAttribute('data-note-step')){ui.notePage=Math.max(0,(ui.notePage??0)+Number(button.dataset.noteStep));renderReader();}
  if(button.hasAttribute('data-page-step')){ui.page=Math.max(0,Math.min(source.pages.length-1,ui.page+Number(button.dataset.pageStep)));renderReader();}
  if(button.hasAttribute('data-inspect-image')){if(source.map){openMap();return;}ui.zoom=!ui.zoom;renderReader();}
 }
});
$('#source-search').addEventListener('input',renderLibrary);
document.addEventListener('input',event=>{const key=event.target.dataset.note;if(key){state=setNote(state,key,event.target.value);persist();}});
document.addEventListener('change',event=>{if(event.target.matches('[data-page-select]')){readerUI[readerSource].page=Number(event.target.value);renderReader();}});
$('#import-file').addEventListener('change',async event=>{
 const file=event.target.files?.[0];event.target.value='';if(!file)return;
 if(file.size>MAX_IMPORT_SIZE){whisper('文件过大，请选择本作导出的旅程文件。');return;}
 let raw;try{raw=await file.text();}catch{whisper('未能读取文件，当前旅程保持原样。');return;}
 if(!raw.trim()){whisper('这份文件是空的，当前旅程保持原样。');return;}
 const imported=restoreStory(raw);if(!imported.ok){whisper(imported.warning);return;}
 pendingImport=imported;$('#import-summary').textContent='将接到“'+currentPage(imported.state).title+'”。'+imported.warning;showDialog('#import-dialog');
});
document.addEventListener('keydown',event=>{
 const tab=event.target.closest('[role="tab"]');
 if(tab&&['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){
  event.preventDefault();const tabs=[...tab.parentElement.querySelectorAll('[role="tab"]')].filter(item=>!item.hidden),i=tabs.indexOf(tab);
  const next=event.key==='Home'?tabs[0]:event.key==='End'?tabs.at(-1):tabs[(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length];
  const journalKey=next.dataset.journalTab,materialKey=next.dataset.materialTab;next.click();document.querySelector(journalKey?`[data-journal-tab="${journalKey}"]`:`[data-material-tab="${materialKey}"]`)?.focus({preventScroll:true});return;
 }
 if(event.ctrlKey||event.metaKey||event.altKey||event.target.closest('input,textarea,[contenteditable="true"]')||document.querySelector('dialog[open]'))return;
 if(event.key.toLowerCase()==='j'){event.preventDefault();actions.journal();}if(event.key.toLowerCase()==='l'){event.preventDefault();actions.library();}
});
for(const dialog of document.querySelectorAll('dialog')){
 const title=dialog.querySelector('h2');if(title){title.id||=dialog.id+'-title';dialog.setAttribute('aria-labelledby',title.id);}
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
}
new ResizeObserver(requestLayout).observe($('#page-scroll'));
for(const id of ['#writing-dialog','#journal-dialog'])$(id).addEventListener('close',()=>renderReading(currentPage(state),{preserveReading:true}));
window.addEventListener('resize',()=>requestAnimationFrame(updatePaper));window.addEventListener('pagehide',event=>{if(!event.persisted)sound.dispose();});
render();
if(warning)whisper(warning);
