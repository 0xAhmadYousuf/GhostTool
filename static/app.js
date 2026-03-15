/* ═══════════════════════════════════════════════
   GhostHelper — Core App JS
   Tools: Shutdown, Focus, Clocks, Schedule,
   Countdown, Notes, Metrics, Unix Converter
   ═══════════════════════════════════════════════ */
'use strict';
const $=id=>document.getElementById(id);
const fmt=s=>[Math.floor(s/3600),Math.floor((s%3600)/60),s%60].map(v=>String(v).padStart(2,'0')).join(':');
const fmt2=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
async function api(p,b){try{await fetch(p,{method:'POST',headers:{'Content-Type':'application/json'},body:b?JSON.stringify(b):undefined})}catch(e){}}

/* ─── TOOL SWITCHING ─── */
const TOOL_NAMES={
  shutdown:'Shutdown Timer',focus:'Focus / Pomodoro',clocks:'World Clocks',
  schedule:'Schedule Shutdown',countdown:'Countdown',notes:'Notes',
  metrics:'System Metrics',unix:'Unix Converter',diff:'Diff Viewer',
  color:'Color Picker',base64:'Base64',passgen:'Password Gen',
  json:'JSON Formatter',urltool:'URL Encode/Decode',hash:'Hash Generator',
  lorem:'Lorem Ipsum',regex:'Regex Tester',calc:'Calculator',
  stopwatch:'Stopwatch',http:'HTTP Status Codes',casecvt:'Case Converter',
  markdown:'Markdown Preview',settings:'Settings'
};
let activeTool='shutdown';

function selectTool(id){
  document.querySelectorAll('.tool-panel').forEach(p=>p.classList.remove('active'));
  $('tool-'+id)?.classList.add('active');
  document.querySelectorAll('.tb-item').forEach(i=>i.classList.remove('act'));
  document.querySelector(`.tb-item[data-tool="${id}"]`)?.classList.add('act');
  $('activeToolName').textContent=TOOL_NAMES[id]||id;
  activeTool=id;
  closeToolbox();
}

/* ─── TOOLBOX OVERLAY ─── */
function openToolbox(){$('toolboxOverlay')?.classList.add('open')}
function closeToolbox(){$('toolboxOverlay')?.classList.remove('open')}

/* ─── PIN / ALWAYS ON TOP ─── */
let pinActive=false;
async function togglePin(){
  pinActive=!pinActive;
  $('pinBtn')?.classList.toggle('active',pinActive);
  await api('/api/ontop',{enabled:pinActive});
}
(async()=>{try{const r=await fetch('/api/ontop');const d=await r.json();pinActive=d.on_top;$('pinBtn')?.classList.toggle('active',pinActive)}catch(e){}})();

/* ─── TOAST ─── */
function toast(msg,ok){
  const a=$('alrt');if(!a)return;
  a.textContent=msg;a.className='alert show '+(ok===false?'err':'ok');
  clearTimeout(a._t);a._t=setTimeout(()=>a.classList.remove('show'),3000);
}

/* ═══════════════════════════════════════
   SHUTDOWN TIMER
═══════════════════════════════════════ */
let sdRun=false,sdPau=false,sdRem=0,sdTot=0,sdTick=null,confOpen=false;
let gTot=10,gSec=10,gId=null;
const CIRC=2*Math.PI*31;

function sp(h,m,s){$('iH').value=h;$('iM').value=m;$('iS').value=s}
function stepField(id,d){const el=$(id);const mx=parseInt(el.max),mn=parseInt(el.min);let v=(parseInt(el.value)||0)+d;if(v>mx)v=mn;if(v<mn)v=mx;el.value=v}

function updSd(){
  const big=$('cdbig'),pb=$('sdpb');if(!big)return;
  big.textContent=fmt(sdRem);
  if(pb)pb.style.width=(sdTot>0?(sdTot-sdRem)/sdTot*100:0)+'%';
  big.className='big-timer'+(sdRem<=60&&sdRun?' urgent':sdPau?' paused':'');
}
function updBtns(){
  const s=$('bStart'),p=$('bPause'),c=$('bStop');
  if(s)s.disabled=sdRun;if(p)p.disabled=!sdRun;if(c)c.disabled=!sdRun;
}
function startTick(){
  clearInterval(sdTick);
  sdTick=setInterval(()=>{if(sdPau||!sdRun||confOpen)return;sdRem=Math.max(0,sdRem-1);updSd();if(sdRem<=0){clearInterval(sdTick);openConf()}},1000);
}
async function onStart(){
  const h=clamp(parseInt($('iH').value)||0,0,23),m=clamp(parseInt($('iM').value)||0,0,59),s=clamp(parseInt($('iS').value)||0,0,59);
  sdTot=h*3600+m*60+s;if(sdTot<=0){toast('// set a valid duration',false);return}
  sdRem=sdTot;sdRun=true;sdPau=false;
  $('cddisp').style.display='block';$('insec').style.display='none';
  $('sdot').className='dot run';$('stxt').textContent='RUNNING';
  updSd();updBtns();await api('/api/start',{seconds:sdTot});startTick();
}
async function onPause(){
  if(!sdRun)return;sdPau=!sdPau;
  $('bPause').textContent=sdPau?'RESUME':'PAUSE';
  $('sdot').className='dot '+(sdPau?'pau':'run');
  $('stxt').textContent=sdPau?'PAUSED':'RUNNING';
  updSd();await api(sdPau?'/api/pause':'/api/resume');if(!sdPau)startTick();
}
async function onStop(){clearInterval(sdTick);sdRun=false;sdPau=false;await api('/api/cancel');resetSd();toast('// cancelled')}
async function onReset(){clearInterval(sdTick);clearInterval(gId);sdRun=false;sdPau=false;confOpen=false;$('ov')?.classList.remove('open');await api('/api/cancel');resetSd()}
function resetSd(){
  $('cddisp').style.display='none';$('insec').style.display='block';
  const b=$('cdbig');if(b){b.textContent='00:00:00';b.className='big-timer'}
  $('sdpb').style.width='0%';$('sdot').className='dot';$('stxt').textContent='IDLE';
  $('bPause').textContent='PAUSE';updBtns();
  const g=document.querySelector('.go');if(g)selGrace(g,10,true);
}
function openConf(){confOpen=true;$('ov').classList.add('open');gTot=10;gSec=10;document.querySelectorAll('.go').forEach(b=>b.classList.remove('sel'));document.querySelector('.go')?.classList.add('sel');startGrace()}
function selGrace(el,s,q){document.querySelectorAll('.go').forEach(b=>b.classList.remove('sel'));if(el)el.classList.add('sel');gTot=s;gSec=s;clearInterval(gId);updRing(s,s);$('rnum').textContent=s;if(!q)startGrace()}
function updRing(c,t){const r=$('ring');if(!r)return;r.style.strokeDasharray=CIRC;r.style.strokeDashoffset=CIRC*(1-c/t)}
function startGrace(){clearInterval(gId);updRing(gSec,gTot);$('rnum').textContent=gSec;gId=setInterval(()=>{gSec--;$('rnum').textContent=gSec;updRing(gSec,gTot);if(gSec<=0){clearInterval(gId);allowShutdown()}},1000)}
async function panicCancel(){clearInterval(gId);$('ov').classList.remove('open');confOpen=false;sdRun=false;await api('/api/cancel');resetSd();toast('// ABORTED')}
async function allowShutdown(){clearInterval(gId);$('ov').classList.remove('open');confOpen=false;await api('/api/execute_shutdown')}
setInterval(async()=>{if(!sdRun||confOpen)return;try{const d=await(await fetch('/api/status')).json();if(d.running)sdRem=d.remaining;else if(!confOpen)openConf()}catch(e){}},5000);

/* ═══════════════════════════════════════
   FOCUS / POMODORO
═══════════════════════════════════════ */
const FM={pomo:{m:25,l:'POMODORO'},short:{m:5,l:'SHORT BREAK'},long:{m:15,l:'LONG BREAK'},flow:{m:90,l:'FLOW STATE'},sprint:{m:52,l:'SPRINT'},custom:{m:45,l:'CUSTOM'}};
let fm='pomo',ftot=25*60,frem=25*60,frun=false,fpau=false,ftick=null,fovOpen=false;
let poms=0,fmins=0,streak=0,slogArr=[];

function updFD(){
  const mm=Math.floor(frem/60),ss=frem%60;
  const ts=String(mm).padStart(2,'0')+':'+String(ss).padStart(2,'0');
  $('fcd').textContent=ts;$('fovt').textContent=ts;
  const el=ftot-frem;
  const fp=$('fpb');if(fp)fp.style.width=(ftot>0?el/ftot*100:0)+'%';
  const fvp=$('fovpb');if(fvp)fvp.style.width=(ftot>0?el/ftot*100:0)+'%';
  $('felap').textContent=fmt2(el);
}
function setFM(mode,el){
  document.querySelectorAll('.mb').forEach(b=>b.classList.remove('act'));
  if(el)el.classList.add('act');fm=mode;
  const cb=$('custBlock');if(cb)cb.style.display=mode==='custom'?'block':'none';
  ftot=FM[mode].m*60;frem=ftot;updFD();
  $('flbl').textContent=FM[mode].l+' \u2014 READY';
  $('cml').textContent=FM.custom.m+' min';
}
function stepCustom(d){FM.custom.m=Math.max(1,Math.min(300,FM.custom.m+d));$('custVal').textContent=FM.custom.m;$('cml').textContent=FM.custom.m+' min';ftot=FM.custom.m*60;frem=ftot;updFD()}
function onFStart(){if(frun)return;frun=true;fpau=false;$('bFS').disabled=true;$('bFP').disabled=false;$('flbl').textContent=FM[fm].l+' \u2014 RUNNING';ftick=setInterval(()=>{if(fpau)return;frem=Math.max(0,frem-1);updFD();if(frem<=0){clearInterval(ftick);onFDone()}},1000)}
function onFPause(){fpau=!fpau;$('bFP').textContent=fpau?'RESUME':'PAUSE';$('flbl').textContent=FM[fm].l+(fpau?' \u2014 PAUSED':' \u2014 RUNNING')}
function onFStop(){clearInterval(ftick);frun=false;fpau=false;frem=ftot;$('bFS').disabled=false;$('bFP').disabled=true;$('bFP').textContent='PAUSE';$('flbl').textContent=FM[fm].l+' \u2014 READY';updFD()}
function onFDone(){frun=false;if(fovOpen)toggleFOv();$('bFS').disabled=false;$('bFP').disabled=true;$('flbl').textContent=FM[fm].l+' \u2014 COMPLETE';if(fm==='pomo'){poms++;streak++}fmins+=Math.round((ftot-frem)/60);const now=new Date();slogArr.unshift({l:FM[fm].l,d:Math.round((ftot-frem)/60)+'m',t:now.toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'})});updLog();frem=ftot;updFD()}
function updLog(){$('tpom').textContent=poms;$('tfoc').textContent=fmins+'m';$('tstr').textContent=streak;const el=$('slog');if(!el)return;if(!slogArr.length){el.innerHTML='<div style="opacity:.35;font-size:10px">// no sessions yet</div>';return}el.innerHTML=slogArr.slice(0,10).map(s=>'<div class="le"><span><b>'+s.l+'</b> ('+s.d+')</span><span>'+s.t+'</span></div>').join('')}
function toggleFOv(){fovOpen=!fovOpen;$('fov')?.classList.toggle('open',fovOpen);if($('fovl'))$('fovl').textContent=FM[fm].l}

/* ═══════════════════════════════════════
   WORLD CLOCKS (all removeable)
═══════════════════════════════════════ */
const DEFAULT_CLOCKS=[
  {id:'uk',tz:'Europe/London',label:'UK / London'},
  {id:'bd',tz:'Asia/Dhaka',label:'BD / Dhaka'},
  {id:'id',tz:'Asia/Jakarta',label:'ID / Jakarta'},
  {id:'eg',tz:'Africa/Cairo',label:'EG / Cairo'},
];
let userClocks=JSON.parse(localStorage.getItem('gh_clocks2')||'null')||DEFAULT_CLOCKS.map(c=>({...c}));

function fmtTZ(tz){const now=new Date();return{t:now.toLocaleTimeString('en-GB',{timeZone:tz,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}),d:now.toLocaleDateString('en-GB',{timeZone:tz,weekday:'short',day:'numeric',month:'short'})}}

function renderClocks(){
  const grid=$('clocksGrid');if(!grid)return;
  grid.innerHTML=userClocks.map(c=>'<div class="clock-card"><div class="cc-city"><b>'+c.label+'</b></div><div class="cc-time" id="ck-'+c.id+'">--:--:--</div><div class="cc-date" id="ck-'+c.id+'-d">---</div><button class="cc-del" onclick="removeClock(\''+c.id+'\')">x</button></div>').join('');
  updClocks();
}
function updClocks(){
  for(const c of userClocks){try{const r=fmtTZ(c.tz);const t=$('ck-'+c.id);if(t)t.textContent=r.t;const d=$('ck-'+c.id+'-d');if(d)d.textContent=r.d}catch(e){}}
  const now=new Date();
  const lt=$('ck-local');if(lt)lt.textContent=now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
  const ld=$('ck-local-d');if(ld)ld.textContent=now.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'});
}
function addClock(){const sel=$('tzSelect');if(!sel||!sel.value)return;const tz=sel.value;const label=tz.replace(/_/g,' ').split('/').pop();const id='c'+Date.now();userClocks.push({id,tz,label});localStorage.setItem('gh_clocks2',JSON.stringify(userClocks));renderClocks();sel.value='';toast('// added '+label)}
function removeClock(id){userClocks=userClocks.filter(c=>c.id!==id);localStorage.setItem('gh_clocks2',JSON.stringify(userClocks));renderClocks()}
setInterval(updClocks,1000);
renderClocks();

/* ═══════════════════════════════════════
   SCHEDULE SHUTDOWN
═══════════════════════════════════════ */
let ssHval=9,ssMval=0,scheds=[];
function rendSS(){const h=$('ssH'),m=$('ssM');if(h)h.textContent=String(ssHval).padStart(2,'0');if(m)m.textContent=String(ssMval).padStart(2,'0')}
function stepSchedH(d){ssHval=(ssHval+d+24)%24;rendSS()}
function stepSchedM(d){ssMval=(ssMval+d+60)%60;rendSS()}
function addSched(){const t=String(ssHval).padStart(2,'0')+':'+String(ssMval).padStart(2,'0');scheds.push({t,id:Date.now(),fired:false});rendScheds();toast('// scheduled '+t)}
function rendScheds(){const el=$('slst');if(!el)return;if(!scheds.length){el.innerHTML='<div style="opacity:.3;font-size:10px">// none</div>';return}el.innerHTML=scheds.map(s=>'<div class="si"><span><b>'+s.t+'</b> > shutdown</span><span class="sdl" onclick="delSched('+s.id+')">x</span></div>').join('')}
function delSched(id){scheds=scheds.filter(s=>s.id!==id);rendScheds()}
function checkScheds(now){const hm=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');scheds.forEach(s=>{if(s.t===hm&&!s.fired&&now.getSeconds()<5){s.fired=true;sdTot=10;sdRem=0;sdRun=true;confOpen=false;setTimeout(openConf,200)}})}
rendSS();rendScheds();

/* ═══════════════════════════════════════
   COUNTDOWN TO TARGET
═══════════════════════════════════════ */
let ctgt=null;
function setCt(){const v=$('ctgt')?.value;if(v)ctgt=new Date(v).getTime()}

/* ═══════════════════════════════════════
   NOTES
═══════════════════════════════════════ */
const NK='gh_notes';let nst=null;
function initNotes(){const ta=$('notesArea');if(!ta)return;ta.value=localStorage.getItem(NK)||'';updNM();ta.addEventListener('input',()=>{clearTimeout(nst);nst=setTimeout(()=>{localStorage.setItem(NK,ta.value);updNM()},600)})}
function updNM(){const ta=$('notesArea'),m=$('notesMeta');if(!ta||!m)return;const c=ta.value.length,w=ta.value.trim()?ta.value.trim().split(/\s+/).length:0,l=ta.value.split('\n').length;m.textContent=c+' chars  |  '+w+' words  |  '+l+' lines  |  auto-saved'}
function clearNotes(){if(!confirm('Clear all notes?'))return;const ta=$('notesArea');if(ta){ta.value='';localStorage.removeItem(NK);updNM()}}
function copyNotes(){const ta=$('notesArea');if(!ta)return;navigator.clipboard.writeText(ta.value).catch(()=>{});toast('// copied')}
initNotes();

/* ═══════════════════════════════════════
   SYSTEM METRICS
═══════════════════════════════════════ */
const SESS=Date.now();
function updDev(){
  const now=new Date(),unix=Math.floor(Date.now()/1000);
  const d=$('dunix');if(d)d.textContent=unix;
  const cu=$('curUnix');if(cu)cu.textContent=unix;
  const ds=$('dsess');if(ds)ds.textContent=fmt(Math.floor((Date.now()-SESS)/1000));
  checkScheds(now);
  if(ctgt){const diff=Math.floor((ctgt-Date.now())/1000);const el=$('ctdisp');if(el)el.textContent=diff>0?(Math.floor(diff/86400)>0?Math.floor(diff/86400)+'d ':'')+String(Math.floor((diff%86400)/3600)).padStart(2,'0')+':'+String(Math.floor((diff%3600)/60)).padStart(2,'0')+':'+String(diff%60).padStart(2,'0'):'// TARGET REACHED'}
}
setInterval(updDev,1000);updDev();
function copyTs(){const ts=String(Math.floor(Date.now()/1000));navigator.clipboard.writeText(ts).catch(()=>{});toast('// copied: '+ts)}

/* Unix converter */
function convertUnix(){
  const v=parseInt($('unixIn')?.value),out=$('convOut');if(!out)return;
  out.style.display='block';
  if(isNaN(v)){out.textContent='// invalid input';return}
  const dd=new Date(v*1000);if(isNaN(dd.getTime())){out.textContent='// invalid timestamp';return}
  const opts={year:'numeric',month:'short',day:'numeric',weekday:'short',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false};
  const zones=['Local','Europe/London','Asia/Dhaka','Asia/Jakarta','Africa/Cairo'];
  const names=['LOCAL  ','UK     ','BD     ','ID     ','EG     '];
  let res='';zones.forEach((tz,i)=>{try{const s=tz==='Local'?dd.toLocaleString('en-GB',opts):dd.toLocaleString('en-GB',{...opts,timeZone:tz});res+=names[i]+': '+s+'\n'}catch(e){res+=names[i]+': error\n'}});
  out.textContent=res.trim();
}

/* ─── KEYBOARD ─── */
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(confOpen)panicCancel();if(fovOpen)toggleFOv();closeToolbox()}});

updBtns();updFD();updLog();

/* ═══════════════════════════════════════
   SETTINGS (brightness, font sizes)
═══════════════════════════════════════ */
const SETTINGS_KEY='gh_settings';
let appSettings={brightness:100,sHdr:100,sReg:100,sTiny:100};

function loadSettings(){
  try{const s=JSON.parse(localStorage.getItem(SETTINGS_KEY));if(s)appSettings={...appSettings,...s}}catch(e){}
  applySettings();
  if($('setBright'))$('setBright').value=appSettings.brightness;
  if($('setHdr'))$('setHdr').value=appSettings.sHdr;
  if($('setReg'))$('setReg').value=appSettings.sReg;
  if($('setTiny'))$('setTiny').value=appSettings.sTiny;
  updSettingsLabels();
}
function applySettings(){
  document.documentElement.style.filter='brightness('+(appSettings.brightness/100)+')';
  document.documentElement.style.setProperty('--s-hdr', appSettings.sHdr/100);
  document.documentElement.style.setProperty('--s-reg', appSettings.sReg/100);
  document.documentElement.style.setProperty('--s-tiny', appSettings.sTiny/100);
}
function saveSettings(){localStorage.setItem(SETTINGS_KEY,JSON.stringify(appSettings))}
function updSettingsLabels(){
  if($('setBrightVal'))$('setBrightVal').textContent=appSettings.brightness+'%';
  if($('setHdrVal'))$('setHdrVal').textContent=appSettings.sHdr+'%';
  if($('setRegVal'))$('setRegVal').textContent=appSettings.sReg+'%';
  if($('setTinyVal'))$('setTinyVal').textContent=appSettings.sTiny+'%';
}
function onSettingsChange(){
  appSettings.brightness=parseInt($('setBright').value);
  appSettings.sHdr=parseInt($('setHdr').value);
  appSettings.sReg=parseInt($('setReg').value);
  appSettings.sTiny=parseInt($('setTiny').value);
  applySettings();saveSettings();updSettingsLabels();
}
function resetSettings(){
  appSettings={brightness:100,sHdr:100,sReg:100,sTiny:100};
  if($('setBright'))$('setBright').value=100;
  if($('setHdr'))$('setHdr').value=100;
  if($('setReg'))$('setReg').value=100;
  if($('setTiny'))$('setTiny').value=100;
  applySettings();saveSettings();updSettingsLabels();toast('// settings reset');
}
setTimeout(loadSettings,100);

/* ═══════════════════════════════════════
   TABBED PANELS (Diff, Markdown)
═══════════════════════════════════════ */
function switchTab(group,tabId){
  document.querySelectorAll('[data-tab-group="'+group+'"]').forEach(p=>p.style.display='none');
  document.querySelectorAll('[data-tab-btn="'+group+'"]').forEach(b=>b.classList.remove('act'));
  const panel=document.querySelector('[data-tab-group="'+group+'"][data-tab-id="'+tabId+'"]');
  const btn=document.querySelector('[data-tab-btn="'+group+'"][data-tab-target="'+tabId+'"]');
  if(panel)panel.style.display='block';
  if(btn)btn.classList.add('act');
}
