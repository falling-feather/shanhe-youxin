/** 实际 UI 操作共用驱动；不写游戏状态、不调用内部推进函数。 */
export function createDriver(page,{settleVisuals=false}={}){
 async function ready(){if(!settleVisuals)return;await page.locator('#scene-background').evaluate(img=>img.decode());if(await page.locator('#portrait').isVisible())await page.locator('#character-image').evaluate(img=>img.decode());}
 async function firstPage(){const prev=page.locator('#paper-pagination [data-paper-turn="-1"]');for(let i=0;i<80&&await prev.count()&&!await prev.isDisabled();i++)await prev.click();}
 async function text(){await firstPage();const chunks=[];for(let i=0;i<80;i++){chunks.push(await page.locator('#page-content').innerText());const next=page.locator('#paper-pagination [data-paper-turn="1"]');if(!await next.count()||await next.isDisabled())break;await next.click();}await firstPage();return chunks.join('\n');}
 async function findInPages(selector){await firstPage();for(let i=0;i<80;i++){if(await page.locator(selector+':visible').count())return page.locator(selector+':visible').first();const next=page.locator('#paper-pagination [data-paper-turn="1"]');if(!await next.count()||await next.isDisabled())break;await next.click();}return null;}
 async function choose(id){
  await text();let target=page.locator('[data-choice="'+id+'"]:visible');
  if(!await target.count()&&await page.locator('[data-action="more-actions"]:visible').count()){await page.locator('[data-action="more-actions"]').click();target=page.locator('[data-choice="'+id+'"]:visible');}
  if(!await target.count()){const found=await findInPages('[data-choice="'+id+'"]');if(found)target=found;}
  await target.first().click();await page.evaluate(()=>new Promise(requestAnimationFrame));await ready();
 }
 async function pick(key,value){await page.locator('[data-edit-tab="'+key+'"]:visible').first().click();await page.locator('[data-edit-slot="'+key+'"][data-edit-value="'+value+'"]:visible').click();await page.evaluate(()=>new Promise(requestAnimationFrame));}
 async function note(key,value){const entry=await findInPages('[data-write-note="'+key+'"]');if(!entry)throw new Error('当前没有书写入口：'+key);await entry.click();await page.locator('#writing-text').fill(value);await page.locator('#writing-dialog .close').click();await page.evaluate(()=>new Promise(requestAnimationFrame));}
 return {choose,pick,note,text,firstPage,async route(ids){for(const id of ids)await choose(id);}};
}
