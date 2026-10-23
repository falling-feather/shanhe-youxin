/** @typedef {{id:string,kind:'text',text:string,offset?:number,tag?:string,className?:string,attributes?:string}|{id:string,kind:'html',html:string}} PaperBlock */
/** @typedef {{id:string,offset:number}|null} ReadingBookmark */

/** 按实际容纳判断分页。文字可分段，交互块不能裁切；返回的片段完整保留原字符。 */
export function paginateBlocks(blocks,fits){
 const pages=[];let current=[];
 const flush=()=>{if(current.length){pages.push(current);current=[];}};
 for(const block of blocks){
  if(fits([...current,block])){current.push(block);continue;}
  flush();
  if(fits([block])){current.push(block);continue;}
  if(block.kind!=='text')throw new RangeError('当前空间放不下完整交互块。');
  const chars=Array.from(block.text);let offset=0;
  while(offset<chars.length){
   let low=1,high=chars.length-offset,accepted=0;
   while(low<=high){const mid=Math.floor((low+high)/2),piece={...block,text:chars.slice(offset,offset+mid).join('')};if(fits([piece])){accepted=mid;low=mid+1;}else high=mid-1;}
   if(!accepted)throw new RangeError('当前空间不足以放下一行正文。');
   if(offset+accepted<chars.length){
    for(let i=accepted-1;i>=Math.floor(accepted*.65);i--)if(/[。！？；，、\n]/u.test(chars[offset+i])){accepted=i+1;break;}
   }
   current=[{...block,text:chars.slice(offset,offset+accepted).join(''),offset:(block.offset??0)+offset}];offset+=accepted;
   if(offset<chars.length)flush();
  }
 }
 flush();return pages.length?pages:[[]];
}

/** 记录正在读的片段，不记录依赖窗口宽高的页码。 */
export function bookmarkForPage(page){
 const first=page[0];return first?{id:first.id,offset:first.kind==='text'?(first.offset??0):0}:null;
}
/** 找到覆盖原阅读位置的页；内容缩短时仍留在同一段落。 */
export function pageForBookmark(pages,bookmark){
 if(!bookmark)return 0;
 let first=-1,nearest=-1;
 for(let index=0;index<pages.length;index++)for(const block of pages[index]){
  if(block.id!==bookmark.id)continue;
  if(first<0)first=index;
  if(block.kind==='html')return index;
  const offset=block.offset??0;
  if(offset<=bookmark.offset){nearest=index;if(bookmark.offset<offset+Array.from(block.text).length)return index;}
 }
 return nearest>=0?nearest:first>=0?first:0;
}

/** DOM 尺寸由排版区提供，不缩字号、不截掉后文；所有按钮只改变阅读页，不改变剧情。 */
export function mountPaperPager({content,nav,viewport,blocks,renderBlock,initialBookmark=null,label='纸页'}){
 const measure=document.createElement('div');measure.className=content.className+' pagination-measure';
 Object.assign(measure.style,{position:'fixed',left:'-20000px',top:'0',width:content.clientWidth+'px',height:'auto',maxHeight:'none',minHeight:'0',visibility:'hidden',pointerEvents:'none',overflow:'visible'});
 content.parentElement.append(measure);
 const available=Math.floor(viewport.clientHeight)-2;
 let pages;
 try{pages=paginateBlocks(blocks,candidate=>{measure.innerHTML=candidate.map(renderBlock).join('');return measure.getBoundingClientRect().height<=available;});}finally{measure.remove();}
 let index=pageForBookmark(pages,initialBookmark);
 let bookmark=initialBookmark&&pages.some(page=>page.some(block=>block.id===initialBookmark.id))?initialBookmark:bookmarkForPage(pages[index]);
 function draw(){
  content.innerHTML=pages[index].map(renderBlock).join('');
  nav.innerHTML=`<button type="button" data-paper-turn="-1" aria-label="上一${label}"${index===0?' disabled':''}>←</button><span>${label} ${index+1} / ${pages.length}</span><button type="button" data-paper-turn="1" aria-label="下一${label}"${index===pages.length-1?' disabled':''}>${index===pages.length-1?'读毕':'继续读'} →</button>`;
  nav.dataset.page=String(index+1);nav.dataset.pages=String(pages.length);
 }
 function onClick(event){const button=event.target.closest('[data-paper-turn]');if(!button||button.disabled)return;index=Math.max(0,Math.min(index+Number(button.dataset.paperTurn),pages.length-1));bookmark=bookmarkForPage(pages[index]);draw();nav.querySelector(`[data-paper-turn="${button.dataset.paperTurn}"]`)?.focus({preventScroll:true});}
 nav.addEventListener('click',onClick);draw();
 return {get bookmark(){return bookmark;},dispose(){nav.removeEventListener('click',onClick);}};
}
