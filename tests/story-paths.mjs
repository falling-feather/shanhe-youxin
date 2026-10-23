import {createStory,choose,editDraft} from '../dist/narrative.mjs';
export const walk=(state,ids)=>ids.reduce((s,id)=>choose(s,id),state);
export const start=()=>walk(createStory(),['open-letter','take-commission','accept-work']);
export const draft=(state,night=true)=>[['motif',night?(state.flags.permission?'shared':'night'):'banner'],['voice',night?'ask':'declare'],['ending',night?'reply':'pledge']].reduce((s,[k,v])=>editDraft(s,k,v),state);
export const toCompose=(listen=true)=>walk(start(),listen?['visit-reader','greet-reader','listen-first','take-story','inspect-proof','begin-setting']:['visit-press','inspect-proof','begin-setting']);
export function toTransfer(listen=true){
 let s=choose(draft(toCompose(listen),listen),'pull-proof');
 s=walk(s,['fold-proof',listen?'fold-booklet':'prepare-oral','walk-to-reader','present-proof','start-reading',listen?'ask-whats-missing':'defend-version']);
 if(listen){s=walk(s,['invite-own-words','revise-together','revise-text']);s=choose(draft(s,true),'pull-revision');s=walk(s,['bring-revision','ask-name']);}
 else s=walk(s,['try-another-form','use-oral']);
 return walk(s,[listen?'name-person':'keep-anonymous','return-workroom','make-handoff']);
}
export function finish(listen=true,handoff='reader'){
 let s=walk(toTransfer(listen),['mark-provisional','continue-handoff',`handoff-${handoff}`,'seal-handoff','close-day','step-on-deck','inspect-trunk','wrap-ledger','back-to-trunk','wrap-proof','back-to-trunk','make-address','write-to-reader','hear-farewell']);
 if(handoff==='self')s=choose(s,'carry-uncertainty');
 return walk(s,['turn-october','find-work-continued','open-return','read-reader','back-to-archive','write-ending','leave-letter']);
}
