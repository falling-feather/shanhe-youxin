import {readFile,writeFile,readdir,mkdir,copyFile,realpath} from 'node:fs/promises';
import {join,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {fingerprint} from './build-fingerprint.mjs';
import {SOURCES} from '../dist/data/sources.mjs';
const root=await realpath(fileURLToPath(new URL('../',import.meta.url))),out=join(root,'output/review-2026-10-22'),stage=join(root,'tmp/round3-package');
const manifest=JSON.parse(await readFile(join(out,'build-manifest.json'),'utf8')),video=JSON.parse(await readFile(join(out,'video-evidence.json'),'utf8'));
if((await fingerprint(root)).build!==manifest.build||video.build!==manifest.build)throw new Error('程序、清单和录屏不属于同一构建');
await mkdir(join(out,'验证'),{recursive:true});await mkdir(join(out,'截图'),{recursive:true});
for(const [source,target] of [['summary.json','UI实走.json'],['layout-summary.json','全节点布局.json']])await copyFile(join(root,'tmp/round3-qa',source),join(out,'验证',target));
for(const name of ['倾听与接续','保留分歧','稿件对照'])await copyFile(join(root,'tmp/round3-qa','final-'+name+'.png'),join(out,'截图',name+'.png'));
for(const [source,target] of [['a08-修订工作台.png','分步修订.png'],['phone-新增稿片.png','手机触达.png']])await copyFile(join(root,'tmp/round3-qa',source),join(out,'截图',target));
await writeFile(join(out,'sources.json'),JSON.stringify({build:manifest.build,sources:SOURCES},null,2)+'\n','utf8');
for(const [source,name] of [['14-对标与独立验收.md','对标与独立验收.md'],['15-统筹复走步骤.md','统筹复走步骤.md']]){
 let text=await readFile(join(root,'doc/01-子文档',source),'utf8');text=text.replace(/^> 该文档隶属于.*\r?\n/m,'');
 text='> 本分发副本对应构建 '+manifest.build+'。原件在项目 doc/01-子文档/'+source+'；开发导航未复制为第二份任务原件。\n\n'+text;
 await writeFile(join(out,name),text,'utf8');
}
await mkdir(stage); // 不覆盖已有临时目录，避免把未知文件混入成果。
async function copyTree(from,to){await mkdir(to,{recursive:true});for(const item of await readdir(from,{withFileTypes:true})){if(item.name.endsWith('.zip')||item.name==='zip-check.json')continue;const source=join(from,item.name),target=join(to,item.name);if(item.isDirectory())await copyTree(source,target);else if(item.isFile())await copyFile(source,target);}}
await copyTree(join(root,'dist'),join(stage,'dist'));await mkdir(join(stage,'scripts'));await copyFile(join(root,'scripts/preview.mjs'),join(stage,'scripts/preview.mjs'));await copyTree(join(root,'tests'),join(stage,'tests'));
await copyFile(join(root,'package.json'),join(stage,'package.json'));
await copyTree(out,stage);
if(!resolve(stage).startsWith(root+sep))throw new Error('打包目标越界');
console.log(JSON.stringify({stage,output:out,build:manifest.build,runtimeFiles:manifest.files.length}));
