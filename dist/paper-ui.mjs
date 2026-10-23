import {esc} from './renderers.mjs';
import {currentPage,proofFor,manuscriptRecord,summaryFor} from './narrative.mjs';
import {mountPaperPager} from './pagination.mjs';

export const textBlock=(id,text,extra={})=>({id,kind:'text',text,...extra});
export function blockMarkup(block){
 if(block.kind==='html')return `<div data-paper-block="${block.id}">${block.html}</div>`;
 const tag=block.tag??'p';return `<${tag} data-paper-block="${block.id}" class="${block.className??'story-paragraph'}"${block.attributes?' '+block.attributes:''}>${esc(block.text)}</${tag}>`;
}
export function storyBlocks(page,state){
 const blocks=[];
 if(page.quotes)for(const [i,quote] of page.quotes.entries()){
  const words=quote.text?esc(quote.text):`${esc(quote.before)}<button class="keyword" type="button" data-choice="${quote.choice}" aria-label="留意信中的${esc(quote.token)}字">${esc(quote.token)}</button>${esc(quote.after)}`;
  blocks.push({id:'quote-'+i,kind:'html',html:`<div class="quoted-fragment"><small>${esc(page.quoteLabel??'研究转引 · 现代排印')}</small><blockquote>${words}</blockquote></div>`});
 }
 page.paragraphs.forEach((text,i)=>blocks.push(textBlock('p-'+i,text)));
 if(page.note&&!state.viewing)blocks.push({id:'write',kind:'html',html:`<button type="button" class="writing-entry" data-write-note="${page.note}">${page.note==='opening'?'展开途中想写的一页':'展开留给后来人的一页'} ↗<small>${state.notes[page.note]?'已在本机留下 '+state.notes[page.note].length+' 字':'可以留白，不计分'}</small></button>`});
 if(page.kind==='ending'){
  summaryFor(state).forEach((text,i)=>blocks.push(textBlock('summary-'+i,text)));
  if(state.notes.closing)blocks.push(textBlock('my-response',state.notes.closing,{tag:'blockquote',className:'own-response'}));
 }
 return blocks;
}
export function proofMarkup(state,{editable=false,flipped=false}={}){
 const shown=state.viewing?state.memories[state.viewing].context:state,lines=proofFor(state),record=manuscriptRecord(state);
 const credit=shown.flags.credit==='named'?'周禾参与试读':shown.flags.credit==='anonymous'?'匿名参与说明':'署名仍待商量';
 const label=editable?(currentPage(state).id==='reviseCompose'?'修订中的试样':'试样预览'):shown.flags.revised?'再次取样':'初次试样';
 const front=lines.map((line,i)=>`<p data-proof-line="${i}" class="${record.first.length&&record.first[i]!==line?'changed-line':''}">${esc(line)}</p>`).join('');
 const back=[shown.flags.format==='oral'?'先口述，留文字核看。':'折为随身页，可以展开复读。',shown.flags.revised?'保留第一次试读的意见和后来取样。':'第一次试读仍有待继续讨论的意见。',credit+'；排印角色：陈师傅。'];
 return `<article class="proof-sheet${flipped?' flipped':''}" aria-label="你的现代创作试样"><div class="proof-front"><header><span class="proof-eyebrow">${label} · 当代创作</span><h2>${shown.draft.motif==='banner'?'同向而行':'在路上'}</h2></header><div class="proof-pages"><div class="proof-content">${front}</div></div><nav class="paper-pagination proof-pagination" aria-label="试样翻页"></nav><footer><span class="proof-sign">${credit}</span><small>演绎试样；改动以朱线标出。</small></footer></div><div class="proof-back"><header><span class="proof-eyebrow">这一页怎样来到这里</span><h2>经手与来处</h2></header><div class="proof-pages"><div class="proof-content">${back.map(line=>`<p>${esc(line)}</p>`).join('')}</div></div><nav class="paper-pagination proof-pagination" aria-label="背面翻页"></nav><footer><small>当代编排，不作为历史订单与回执。</small></footer></div>${!editable?'<button class="proof-flip" type="button" data-action="flip-proof">翻到'+(flipped?'正面':'背面')+' ↻</button>':''}</article>`;
}
export function receiptMarkup(state){
 const past=state.viewing?state.memories[state.viewing].context:null;
 const r=manuscriptRecord(past?{...state,flags:past.flags,draft:past.draft,visited:state.visited.slice(0,state.visited.indexOf(state.viewing)+1)}:state);
 return `<article class="receipt-paper"><small>演绎交接存根 · 由你的行动形成</small><h2>下一双手</h2><dl><dt>已取样</dt><dd>${r.editions?r.editions+' 次':'尚未落墨'}</dd><dt>接手人</dt><dd class="recipient-name">${r.recipient}</dd><dt>记录</dt><dd>${r.notation}</dd><dt>后续</dt><dd>${r.response}</dd></dl><span class="receipt-stamp">${r.recipient==='自行携带'?'接手待定':'留此存照'}</span><button type="button" class="ink-link" data-action="compare-proof">${r.editions>1?'对读两次取样':'查看当前取样'} ↗</button><p>这张存根是演绎记录，真实原刊与转引另有来处。</p></article>`;
}
export function comparisonMarkup(state){
 const r=manuscriptRecord(state);
 if(!r.editions)return '<p class="empty-note">还没有取出第一张试样。预览中的文字尚未作为已印成的稿件记录。</p>';
 const sheets=[['第一次取样',r.first],...(r.editions>1?[['后来取样',r.last]]:[])];
 return `<p class="small-note">当代演绎试样；从实际取样时的快照对读。改变的段落以朱线标示。</p><div class="comparison-spread">${sheets.map(([title,lines],side)=>`<article><small>${title}</small><h3>在路上</h3>${lines.map((text,i)=>`<p class="${r.changed.includes(i)?'changed-line':''}">${esc(text)}</p>`).join('')}</article>`).join('')}</div><p class="record-summary">${r.recipient} · ${r.notation} · ${r.response}</p>`;
}
const proofData=new WeakMap();
let activeProofPagers=[];
export function fitProofPagers(root){
 const previous=new Map(activeProofPagers.map(entry=>[entry.content,entry.pager.bookmark]));
 for(const entry of activeProofPagers)entry.pager.dispose();activeProofPagers=[];
 for(const content of root.querySelectorAll('.proof-content')){
  const viewport=content.parentElement;if(viewport.clientHeight<20||viewport.clientWidth<20)continue;
  if(!proofData.has(content))proofData.set(content,[...content.querySelectorAll('p')].map((p,i)=>textBlock('proof-'+i,p.textContent,{className:p.className,attributes:p.hasAttribute('data-proof-line')?'data-proof-line="'+p.dataset.proofLine+'"':''})));
  const nav=viewport.nextElementSibling;
  activeProofPagers.push({content,pager:mountPaperPager({content,viewport,nav,blocks:proofData.get(content),renderBlock:blockMarkup,label:'稿面',initialBookmark:previous.get(content)??null})});
 }
}
