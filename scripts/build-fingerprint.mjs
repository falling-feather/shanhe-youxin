import {readdir,readFile} from 'node:fs/promises';
import {join,relative} from 'node:path';
import {createHash} from 'node:crypto';
export async function fingerprint(root){
 const files=[];
 async function visit(dir){for(const item of await readdir(dir,{withFileTypes:true})){const path=join(dir,item.name);if(item.isDirectory())await visit(path);else if(item.isFile()){const data=await readFile(path);files.push({path:relative(root,path).replaceAll('\\','/'),bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});}}}
 await visit(join(root,'dist'));files.sort((a,b)=>a.path.localeCompare(b.path));
 const digest=createHash('sha256').update(files.map(f=>f.path+'\0'+f.sha256).join('\n')).digest('hex');
 return {clientDate:'2026-10-22',build:digest,files};
}
