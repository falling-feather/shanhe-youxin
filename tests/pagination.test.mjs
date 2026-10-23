import test from 'node:test';
import assert from 'node:assert/strict';
import {paginateBlocks,bookmarkForPage,pageForBookmark,mountPaperPager} from '../dist/pagination.mjs';
const fit=limit=>blocks=>blocks.reduce((n,b)=>n+(b.kind==='text'?Array.from(b.text).length:8)+2,0)<=limit;
test('分页保留全文、段落顺序、标点和 Unicode，不靠裁掉后文通过',()=>{
 const text='先听他说完。我们走得不一样快，仍一起往前走。🕯️纸上的问候，还在。';
 const source=[{id:'a',kind:'text',text},{id:'b',kind:'text',text:'另一段\n也留下。'}];
 const pages=paginateBlocks(source,fit(18));assert.ok(pages.length>2);
 assert.equal(pages.flat().filter(b=>b.id==='a').map(b=>b.text).join(''),text);
 assert.equal(pages.flat().filter(b=>b.id==='b').map(b=>b.text).join(''),source[1].text);
 for(const page of pages)assert.ok(fit(18)(page));
});
test('可交互原文块保持完整，空间不足时明确报错而非隐藏控件',()=>{
 const source=[{id:'a',kind:'text',text:'一段叙述。'},{id:'q',kind:'html',html:'<button>拟</button>'}];
 const pages=paginateBlocks(source,fit(12));assert.equal(pages.at(-1)[0].html,source[1].html);
 assert.throws(()=>paginateBlocks([{id:'q',kind:'html',html:'原文'}],()=>false),/空间/);
 assert.throws(()=>paginateBlocks([{id:'t',kind:'text',text:'字'}],()=>false),/空间/);
});
test('空正文仍是一页，窄与宽两种排版都完整保留文本',()=>{
 assert.deepEqual(paginateBlocks([],fit(30)),[[]]);
 const blocks=[{id:'a',kind:'text',text:'甲'.repeat(80)},{id:'b',kind:'text',text:'乙'.repeat(60)}];
 for(const size of [9,30,200])assert.equal(paginateBlocks(blocks,fit(size)).flat().map(b=>b.text).join(''),blocks.map(b=>b.text).join(''));
});
test('窗口重排后按阅读段落和字符位置续读，不能把旧页码当成新位置',()=>{
 const blocks=[{id:'intro',kind:'text',text:'灯下。'},{id:'long',kind:'text',text:'甲'.repeat(96)},{id:'end',kind:'text',text:'交接。'}];
 const narrow=paginateBlocks(blocks,fit(18)),bookmark=bookmarkForPage(narrow[4]);
 assert.deepEqual(bookmark,{id:'long',offset:48});
 const wide=paginateBlocks(blocks,fit(44)),index=pageForBookmark(wide,bookmark);
 assert.notEqual(index,4);
 assert.ok(wide[index].some(block=>block.id===bookmark.id&&(block.offset??0)<=bookmark.offset&&bookmark.offset<(block.offset??0)+Array.from(block.text).length));
 const smaller=paginateBlocks(blocks,fit(12)),again=pageForBookmark(smaller,bookmark);
 assert.ok(smaller[again].some(block=>block.id===bookmark.id&&(block.offset??0)<=bookmark.offset&&bookmark.offset<(block.offset??0)+Array.from(block.text).length));
});
test('原文交互块按身份定位，复排不会将“拟”字留在错误的一页',()=>{
 const blocks=[{id:'lead',kind:'text',text:'先读问候。'},{id:'quote',kind:'html',html:'<button>拟</button>'},{id:'after',kind:'text',text:'再带着问题走进去。'}];
 const small=paginateBlocks(blocks,fit(12)),bookmark=bookmarkForPage(small[1]);
 assert.deepEqual(bookmark,{id:'quote',offset:0});
 const wide=paginateBlocks(blocks,fit(40));assert.ok(wide[pageForBookmark(wide,bookmark)].some(block=>block.id==='quote'));
});
test('文本分段标记使用Unicode字符位置，仍完整保留原文字',()=>{
 const text='🕯️甲乙丙丁'.repeat(16),pages=paginateBlocks([{id:'p',kind:'text',text}],fit(13));
 let offset=0;for(const piece of pages.flat()){assert.equal(piece.offset,offset);offset+=Array.from(piece.text).length;}
 assert.equal(pages.flat().map(piece=>piece.text).join(''),text);
});
test('空页或已不在当前纸页中的位置回到第一页，缩短的段落仍定位到原段',()=>{
 assert.equal(bookmarkForPage([]),null);assert.equal(pageForBookmark([[]],null),0);
 const pages=paginateBlocks([{id:'intro',kind:'text',text:'前言。'},{id:'old',kind:'text',text:'旧话已缩短。'},{id:'next',kind:'text',text:'下一件事。'}],fit(12));
 assert.equal(pageForBookmark(pages,{id:'missing',offset:0}),0);
 assert.ok(pages[pageForBookmark(pages,{id:'old',offset:80})].some(block=>block.id==='old'));
});
test('阅读控制器连续重排保持原锚点，只有真正翻页才更新读到的位置',()=>{
 const originalDocument=globalThis.document;
 globalThis.document={createElement:()=>({className:'',style:{},innerHTML:'',getBoundingClientRect(){return {height:Array.from(this.innerHTML).length};},remove(){}})};
 const content={className:'',clientWidth:100,innerHTML:'',parentElement:{append(){}}};
 function navigation(){return {innerHTML:'',dataset:{},listener:null,addEventListener(name,fn){this.listener=fn;},removeEventListener(){this.listener=null;},querySelector(){return {focus(){}};}};}
 const blocks=[{id:'long',kind:'text',text:'甲'.repeat(120)}];
 const open=(height,bookmark=null)=>{const nav=navigation();return {nav,pager:mountPaperPager({content,nav,viewport:{clientHeight:height+2},blocks,renderBlock:block=>block.text,initialBookmark:bookmark})};};
 const turn=nav=>nav.listener({target:{closest:()=>({disabled:false,dataset:{paperTurn:'1'}})}});
 let current;
 try{
  current=open(18);turn(current.nav);turn(current.nav);const bookmark=current.pager.bookmark;assert.equal(bookmark.offset,36);current.pager.dispose();
  current=open(44,bookmark);assert.deepEqual(current.pager.bookmark,bookmark);assert.equal(current.nav.dataset.page,'1');current.pager.dispose();
  current=open(12,bookmark);assert.deepEqual(current.pager.bookmark,bookmark);assert.equal(current.nav.dataset.page,'4');turn(current.nav);assert.equal(current.pager.bookmark.offset,48);
 }finally{current?.pager.dispose();if(originalDocument===undefined)delete globalThis.document;else globalThis.document=originalDocument;}
});
