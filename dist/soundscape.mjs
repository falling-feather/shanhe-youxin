/** 现代程序音景，不引用战时录音；只有用户点开声音后才创建音频上下文。 */
export function createSoundscape(){
 let context=null,master=null,filter=null,noise=null,enabled=false,scene='room',pulseTimer=null;
 const tones={rain:{frequency:1500,gain:.026},room:{frequency:360,gain:.012},press:{frequency:700,gain:.016},river:{frequency:220,gain:.032}};
 function stopPulse(){clearInterval(pulseTimer);pulseTimer=null;}
 function tick(){
  if(!enabled||document.hidden||scene!=='press'||!context)return;
  const osc=context.createOscillator(),gain=context.createGain(),now=context.currentTime;
  osc.type='triangle';osc.frequency.setValueAtTime(86,now);osc.frequency.exponentialRampToValueAtTime(39,now+.11);
  gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.024,now+.008);gain.gain.exponentialRampToValueAtTime(.0001,now+.14);
  osc.connect(gain).connect(master);osc.start(now);osc.stop(now+.16);
 }
 function tune(){
  if(!context)return;
  const tone=tones[scene]??tones.room;
  filter.frequency.setTargetAtTime(tone.frequency,context.currentTime,.9);
  master.gain.setTargetAtTime(enabled&&!document.hidden?1:0,context.currentTime,.3);
  noise.gain.setTargetAtTime(tone.gain,context.currentTime,.9);
  stopPulse();if(enabled&&scene==='press')pulseTimer=setInterval(tick,1700);
 }
 async function toggle(){
  if(!context){
   const Audio=window.AudioContext??window.webkitAudioContext;
   if(!Audio)throw new Error('当前浏览器暂不支持声音，故事仍可继续。');
   context=new Audio();master=context.createGain();master.gain.value=0;master.connect(context.destination);
   filter=context.createBiquadFilter();filter.type='lowpass';filter.Q.value=.3;
   noise=context.createGain();filter.connect(noise).connect(master);
   const buffer=context.createBuffer(1,context.sampleRate*4,context.sampleRate),samples=buffer.getChannelData(0);
   let smooth=0;for(let i=0;i<samples.length;i++){smooth=.88*smooth+(Math.random()*2-1)*.12;samples[i]=smooth;}
   const source=context.createBufferSource();source.buffer=buffer;source.loop=true;source.connect(filter);source.start();
  }
  await context.resume();enabled=!enabled;tune();return enabled;
 }
 const visibility=()=>tune();document.addEventListener('visibilitychange',visibility);
 return {toggle,setScene(value){scene=value;tune();},get enabled(){return enabled;},dispose(){stopPulse();document.removeEventListener('visibilitychange',visibility);context?.close();}};
}
