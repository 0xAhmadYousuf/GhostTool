/* ═══════════════════════════════════════════════
   GhostHelper — Extended Tools JS
   Diff, Color, Base64, PassGen, JSON, URL,
   Hash, Lorem, Regex, Calc, Stopwatch,
   HTTP Codes, Case Converter, Markdown
   ═══════════════════════════════════════════════ */
'use strict';

function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

/* ═══════════════════════════════════════
   DIFF VIEWER
═══════════════════════════════════════ */
let diffMode='unified';
function setDiffMode(m,el){diffMode=m;document.querySelectorAll('.dmode-btn').forEach(b=>b.classList.remove('act'));if(el)el.classList.add('act');runDiff()}

function buildLCS(a,b){
  const m=a.length,n=b.length;
  if(m*n>500000)return a.filter(l=>b.includes(l)).slice(0,2000);
  const dp=Array.from({length:m+1},()=>new Int32Array(n+1));
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);
  const lcs=[];let i=m,j=n;while(i>0&&j>0){if(a[i-1]===b[j-1]){lcs.unshift(a[i-1]);i--;j--}else if(dp[i-1][j]>dp[i][j-1])i--;else j--}return lcs;
}
function normLine(s){let r=s;if($('diffIgnWs')?.checked)r=r.replace(/\s+/g,' ').trim();if($('diffIgnCase')?.checked)r=r.toLowerCase();return r}
function computeOps(a,b){
  const an=a.map(normLine),bn=b.map(normLine),lcs=buildLCS(an,bn);
  const ops=[];let ai=0,bi=0,li=0;
  while(ai<a.length||bi<b.length){
    if(ai<a.length&&bi<b.length&&li<lcs.length&&an[ai]===lcs[li]&&bn[bi]===lcs[li]){ops.push({type:'eq',la:ai+1,lb:bi+1,text:a[ai]});ai++;bi++;li++}
    else if(bi<b.length&&(li>=lcs.length||bn[bi]!==lcs[li])){ops.push({type:'add',la:null,lb:bi+1,text:b[bi]});bi++}
    else{ops.push({type:'rem',la:ai+1,lb:null,text:a[ai]});ai++}
  }return ops;
}
function charDiff(rem,add){
  let pf=0;while(pf<rem.length&&pf<add.length&&rem[pf]===add[pf])pf++;
  let sf=0;while(sf<rem.length-pf&&sf<add.length-pf&&rem[rem.length-1-sf]===add[add.length-1-sf])sf++;
  const rm=rem.slice(pf,rem.length-sf),am=add.slice(pf,add.length-sf),pre=esc(rem.slice(0,pf)),suf=esc(rem.slice(rem.length-sf));
  return{remHtml:pre+(rm?'<mark class="inline-rem">'+esc(rm)+'</mark>':'')+suf,addHtml:pre+(am?'<mark class="inline-add">'+esc(am)+'</mark>':'')+suf}
}
function applyCtx(ops,ctx){
  if(ctx<0)ctx=0;const changed=new Set();ops.forEach((o,i)=>{if(o.type!=='eq')changed.add(i)});
  const vis=new Set();changed.forEach(i=>{for(let k=Math.max(0,i-ctx);k<=Math.min(ops.length-1,i+ctx);k++)vis.add(k)});
  const res=[];let last=-1;ops.forEach((o,i)=>{if(!vis.has(i))return;if(last!==-1&&i>last+1)res.push({type:'hdr',text:'@@'});res.push(o);last=i});return res;
}
function runDiff(){
  const aR=$('diffA')?.value||'',bR=$('diffB')?.value||'',out=$('diffOutput');if(!out)return;
  if(!aR.trim()&&!bR.trim()){out.innerHTML='<div class="diff-empty">// paste code into A and B, then click RUN DIFF</div>';return}
  const aL=aR.split('\n'),bL=bR.split('\n'),ctx=Math.max(0,parseInt($('diffCtx')?.value)||3);
  const ops=computeOps(aL,bL),added=ops.filter(o=>o.type==='add').length,removed=ops.filter(o=>o.type==='rem').length;
  const sa=$('dStatAdd'),sr=$('dStatRem');if(sa)sa.textContent='+'+added;if(sr)sr.textContent='-'+removed;
  const co=applyCtx(ops,ctx);let html='';
  if(diffMode==='unified'){
    html=co.map(o=>{if(o.type==='hdr')return'<tr class="d-hdr-row"><td class="ln" colspan="2"></td><td class="sign"></td><td class="content">'+esc(o.text)+'</td></tr>';const la=o.la!=null?o.la:'',lb=o.lb!=null?o.lb:'',sign=o.type==='add'?'+':o.type==='rem'?'-':' ',cls=o.type==='add'?'d-add-row':o.type==='rem'?'d-rem-row':'';return'<tr class="'+cls+'"><td class="ln">'+la+'</td><td class="ln">'+lb+'</td><td class="sign">'+sign+'</td><td class="content">'+esc(o.text)+'</td></tr>'}).join('');
    html=html?'<table class="diff-table">'+html+'</table>':'<div class="diff-empty">// no differences</div>';
  }else if(diffMode==='inline'){
    const rows=[];let i=0;while(i<co.length){const o=co[i];if(o.type==='hdr'){rows.push('<tr class="d-hdr-row"><td class="ln" colspan="2"></td><td class="sign"></td><td class="content">'+esc(o.text)+'</td></tr>');i++;continue}if(o.type==='rem'&&i+1<co.length&&co[i+1].type==='add'){const cd=charDiff(co[i].text,co[i+1].text);rows.push('<tr class="d-rem-row"><td class="ln">'+co[i].la+'</td><td class="ln"></td><td class="sign">-</td><td class="content">'+cd.remHtml+'</td></tr>');rows.push('<tr class="d-add-row"><td class="ln"></td><td class="ln">'+co[i+1].lb+'</td><td class="sign">+</td><td class="content">'+cd.addHtml+'</td></tr>');i+=2;continue}const sign=o.type==='add'?'+':o.type==='rem'?'-':' ',cls=o.type==='add'?'d-add-row':o.type==='rem'?'d-rem-row':'';rows.push('<tr class="'+cls+'"><td class="ln">'+(o.la||'')+'</td><td class="ln">'+(o.lb||'')+'</td><td class="sign">'+sign+'</td><td class="content">'+esc(o.text)+'</td></tr>');i++}
    html=rows.length?'<table class="diff-table">'+rows.join('')+'</table>':'<div class="diff-empty">// no differences</div>';
  }
  out.innerHTML=html;
}
['diffA','diffB'].forEach(id=>{const el=$(id);if(el)el.addEventListener('paste',()=>setTimeout(runDiff,50))});

/* ═══════════════════════════════════════
   COLOR PICKER
═══════════════════════════════════════ */
let colorHistory=JSON.parse(localStorage.getItem('gh_colors')||'[]');
function updColor(){
  const inp=$('colorInput');if(!inp)return;const hex=inp.value;
  $('colorPreview').style.background=hex;
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  $('cvHex').textContent=hex.toUpperCase();
  $('cvRgb').textContent='rgb('+r+', '+g+', '+b+')';
  const max=Math.max(r,g,b)/255,min=Math.min(r,g,b)/255,l=(max+min)/2;
  let h=0,s=0;if(max!==min){const d=max-min;s=l>.5?d/(2-max-min):d/(max+min);switch(Math.max(r,g,b)){case r:h=((g-b)/255/d+(g<b?6:0));break;case g:h=((b-r)/255/d+2);break;case b:h=((r-g)/255/d+4);break}h=Math.round(h*60)}s=Math.round(s*100);const ll=Math.round(l*100);
  $('cvHsl').textContent='hsl('+h+', '+s+'%, '+ll+'%)';
  const lum=0.2126*(r/255)+0.7152*(g/255)+0.0722*(b/255);
  const cr1=(1.05)/(lum+.05),cr2=(lum+.05)/(.05);const ratio=Math.max(cr1,cr2);
  const aa=ratio>=4.5?'PASS':'FAIL',aaa=ratio>=7?'PASS':'FAIL';
  $('contrastInfo').innerHTML='<b>Contrast vs white:</b> '+ratio.toFixed(1)+':1 | AA: '+aa+' | AAA: '+aaa;
}
function pickColor(){const inp=$('colorInput');if(inp)inp.click()}
function addColorHistory(){
  const hex=$('colorInput')?.value;if(!hex)return;
  colorHistory=colorHistory.filter(c=>c!==hex);colorHistory.unshift(hex);
  if(colorHistory.length>10)colorHistory.pop();
  localStorage.setItem('gh_colors',JSON.stringify(colorHistory));renderColorHist();toast('// saved');
}
function renderColorHist(){
  const el=$('colorHist');if(!el)return;
  el.innerHTML=colorHistory.map(c=>'<div class="ch-swatch" style="background:'+c+'" onclick="setColorFromHist(\''+c+'\')" title="'+c+'"></div>').join('');
}
function setColorFromHist(c){const inp=$('colorInput');if(inp){inp.value=c;updColor()}}
function copyColorVal(id){const el=$(id);if(!el)return;navigator.clipboard.writeText(el.textContent).catch(()=>{});toast('// copied')}
renderColorHist();

/* ═══════════════════════════════════════
   BASE64
═══════════════════════════════════════ */
function b64Encode(){const v=$('b64In')?.value||'';try{$('b64Out').textContent=btoa(unescape(encodeURIComponent(v)))}catch(e){$('b64Out').textContent='// error: '+e.message}}
function b64Decode(){const v=$('b64In')?.value||'';try{$('b64Out').textContent=decodeURIComponent(escape(atob(v)))}catch(e){$('b64Out').textContent='// error: invalid base64'}}
function b64Copy(){const el=$('b64Out');if(el){navigator.clipboard.writeText(el.textContent).catch(()=>{});toast('// copied')}}

/* ═══════════════════════════════════════
   PASSWORD / TOKEN GEN
═══════════════════════════════════════ */
let pwLen=16;
function updPwLen(){const r=$('pwRange');if(r){pwLen=parseInt(r.value);$('pwLenVal').textContent=pwLen}}
function genPw(){
  const uc=$('pwUpper')?.classList.contains('on'),lc=$('pwLower')?.classList.contains('on'),num=$('pwNum')?.classList.contains('on'),sym=$('pwSym')?.classList.contains('on');
  let chars='';if(uc)chars+='ABCDEFGHIJKLMNOPQRSTUVWXYZ';if(lc)chars+='abcdefghijklmnopqrstuvwxyz';if(num)chars+='0123456789';if(sym)chars+='!@#$%^&*()-_=+[]{}|;:,.<>?/~';
  if(!chars){toast('// enable at least one option',false);return}
  const arr=new Uint32Array(pwLen);crypto.getRandomValues(arr);
  let pw='';for(let i=0;i<pwLen;i++)pw+=chars[arr[i]%chars.length];
  $('pwOutput').textContent=pw;updPwStrength(pw);
}
function genUuid(){$('pwOutput').textContent=crypto.randomUUID();updPwStrength('')}
function updPwStrength(pw){
  const bar=$('pwStrBar');if(!bar||!pw){if(bar)bar.style.width='0';return}
  let score=0;if(pw.length>=12)score++;if(pw.length>=20)score++;if(/[A-Z]/.test(pw))score++;if(/[a-z]/.test(pw))score++;if(/[0-9]/.test(pw))score++;if(/[^A-Za-z0-9]/.test(pw))score++;
  const pct=Math.min(100,score/6*100);const col=pct<40?'var(--red)':pct<70?'var(--am)':'var(--grn)';
  bar.style.width=pct+'%';bar.style.background=col;
}
function genBulk(){
  const count=parseInt($('pwBulkCount')?.value)||5;const list=$('pwList');if(!list)return;
  const uc=$('pwUpper')?.classList.contains('on'),lc=$('pwLower')?.classList.contains('on'),num=$('pwNum')?.classList.contains('on'),sym=$('pwSym')?.classList.contains('on');
  let chars='';if(uc)chars+='ABCDEFGHIJKLMNOPQRSTUVWXYZ';if(lc)chars+='abcdefghijklmnopqrstuvwxyz';if(num)chars+='0123456789';if(sym)chars+='!@#$%^&*()-_=+[]{}|;:,.<>?/~';
  if(!chars){toast('// enable at least one option',false);return}
  let html='';for(let n=0;n<count;n++){const arr=new Uint32Array(pwLen);crypto.getRandomValues(arr);let pw='';for(let i=0;i<pwLen;i++)pw+=chars[arr[i]%chars.length];html+='<div class="pw-item" onclick="navigator.clipboard.writeText(this.textContent)">'+pw+'</div>'}
  list.innerHTML=html;
}
function copyPw(){const el=$('pwOutput');if(el){navigator.clipboard.writeText(el.textContent).catch(()=>{});toast('// copied')}}
function togglePwOpt(id){$(id)?.classList.toggle('on')}

/* ═══════════════════════════════════════
   JSON FORMATTER
═══════════════════════════════════════ */
function jsonFormat(){
  const v=$('jsonIn')?.value||'',out=$('jsonOut');if(!out)return;
  try{const obj=JSON.parse(v);const indent=$('jsonIndent')?.value||'2';out.textContent=JSON.stringify(obj,null,indent==='tab'?'\t':parseInt(indent));out.className='json-output'}catch(e){out.textContent='// ERROR: '+e.message;out.className='json-output json-err'}
}
function jsonMinify(){
  const v=$('jsonIn')?.value||'',out=$('jsonOut');if(!out)return;
  try{const obj=JSON.parse(v);out.textContent=JSON.stringify(obj);out.className='json-output'}catch(e){out.textContent='// ERROR: '+e.message;out.className='json-output json-err'}
}
function jsonCopy(){const el=$('jsonOut');if(el){navigator.clipboard.writeText(el.textContent).catch(()=>{});toast('// copied')}}

/* ═══════════════════════════════════════
   URL ENCODE/DECODE
═══════════════════════════════════════ */
function urlEncode(){const v=$('urlIn')?.value||'';$('urlOut').textContent=encodeURIComponent(v)}
function urlDecode(){const v=$('urlIn')?.value||'';try{$('urlOut').textContent=decodeURIComponent(v)}catch(e){$('urlOut').textContent='// error: '+e.message}}
function urlParse(){
  const v=$('urlIn')?.value||'',out=$('urlOut');
  try{const u=new URL(v);let r='Protocol: '+u.protocol+'\nHost: '+u.host+'\nPath: '+u.pathname+'\nSearch: '+u.search+'\nHash: '+u.hash;
  if(u.searchParams){r+='\n\nParameters:\n';u.searchParams.forEach((val,key)=>{r+=key+' = '+val+'\n'})}out.textContent=r}catch(e){out.textContent='// error: not a valid URL'}
}
function urlCopy(){const el=$('urlOut');if(el){navigator.clipboard.writeText(el.textContent).catch(()=>{});toast('// copied')}}

/* ═══════════════════════════════════════
   HASH GENERATOR (Web Crypto API)
═══════════════════════════════════════ */
async function genHash(){
  const v=$('hashIn')?.value||'';const enc=new TextEncoder().encode(v);
  const algos=['SHA-1','SHA-256','SHA-384','SHA-512'];
  const container=$('hashResults');if(!container)return;
  let html='';
  for(const algo of algos){
    try{const buf=await crypto.subtle.digest(algo,enc);const arr=Array.from(new Uint8Array(buf));const hex=arr.map(b=>b.toString(16).padStart(2,'0')).join('');
    html+='<div class="hash-row"><span class="hash-algo">'+algo+'</span><span class="hash-val" id="hv-'+algo+'">'+hex+'</span><button class="hash-copy" onclick="navigator.clipboard.writeText(document.getElementById(\'hv-'+algo+'\').textContent);toast(\'// copied\')">COPY</button></div>'}catch(e){html+='<div class="hash-row"><span class="hash-algo">'+algo+'</span><span class="hash-val">error</span></div>'}
  }
  container.innerHTML=html;
  const cmp=$('hashCompare')?.value?.trim().toLowerCase();
  if(cmp){let match=false;document.querySelectorAll('.hash-val').forEach(el=>{if(el.textContent===cmp){el.style.color='var(--grn)';match=true}});if(!match)toast('// no match',false);else toast('// match found!')}
}

/* ═══════════════════════════════════════
   LOREM IPSUM
═══════════════════════════════════════ */
const LOREM_WORDS='lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillam fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ');
function genLorem(){
  const unit=$('loremUnit')?.value||'paragraphs';const count=parseInt($('loremCount')?.value)||3;
  let result='';
  if(unit==='words'){for(let i=0;i<count;i++)result+=(i>0?' ':'')+LOREM_WORDS[i%LOREM_WORDS.length];result=result.charAt(0).toUpperCase()+result.slice(1)+'.'}
  else if(unit==='sentences'){for(let s=0;s<count;s++){let sent='';const wc=8+Math.floor(Math.random()*12);for(let i=0;i<wc;i++)sent+=(i>0?' ':'')+LOREM_WORDS[(s*10+i)%LOREM_WORDS.length];result+=(s>0?' ':'')+sent.charAt(0).toUpperCase()+sent.slice(1)+'.'}}
  else{for(let p=0;p<count;p++){let para='';const sc=3+Math.floor(Math.random()*4);for(let s=0;s<sc;s++){let sent='';const wc=8+Math.floor(Math.random()*12);for(let i=0;i<wc;i++)sent+=(i>0?' ':'')+LOREM_WORDS[(p*30+s*10+i)%LOREM_WORDS.length];para+=(s>0?' ':'')+sent.charAt(0).toUpperCase()+sent.slice(1)+'.'}result+=(p>0?'\n\n':'')+para}}
  $('loremOut').textContent=result;
}
function loremCopy(){const el=$('loremOut');if(el){navigator.clipboard.writeText(el.textContent).catch(()=>{});toast('// copied')}}

/* ═══════════════════════════════════════
   REGEX TESTER
═══════════════════════════════════════ */
function testRegex(){
  const pattern=$('regexPattern')?.value||'',testStr=$('regexTest')?.value||'',out=$('regexOutput'),matches=$('regexMatches');
  if(!out)return;
  let flags='';if($('rgG')?.classList.contains('on'))flags+='g';if($('rgI')?.classList.contains('on'))flags+='i';if($('rgM')?.classList.contains('on'))flags+='m';if($('rgS')?.classList.contains('on'))flags+='s';
  try{
    const re=new RegExp(pattern,flags);
    if(flags.includes('g')){
      let matchList=[];const re2=new RegExp(pattern,flags);
      const allMatches=[...testStr.matchAll(re2)];
      if(allMatches.length===0){out.innerHTML=esc(testStr);matches.textContent='// no matches';return}
      let result='',last=0;
      allMatches.forEach((m,i)=>{result+=esc(testStr.slice(last,m.index))+'<mark class="regex-match">'+esc(m[0])+'</mark>';last=m.index+m[0].length;matchList.push((i+1)+': "'+m[0]+'" at '+m.index)});
      result+=esc(testStr.slice(last));out.innerHTML=result;
      matches.textContent=allMatches.length+' match(es)\n'+matchList.join('\n');
    }else{
      const m=re.exec(testStr);
      if(!m){out.innerHTML=esc(testStr);matches.textContent='// no match';return}
      out.innerHTML=esc(testStr.slice(0,m.index))+'<mark class="regex-match">'+esc(m[0])+'</mark>'+esc(testStr.slice(m.index+m[0].length));
      matches.textContent='Match: "'+m[0]+'" at index '+m.index;if(m.length>1)matches.textContent+='\nGroups: '+m.slice(1).map((g,i)=>(i+1)+': "'+g+'"').join(', ');
    }
  }catch(e){out.textContent='// regex error: '+e.message;matches.textContent=''}
}
function setRegexPreset(p){
  const presets={email:'[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}',url:'https?://[\\w\\-._~:/?#[\\]@!$&\'()*+,;=]+',ip:'\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b',phone:'\\+?[\\d\\s\\-().]{7,15}',date:'\\d{4}[-/]\\d{2}[-/]\\d{2}'};
  const el=$('regexPattern');if(el&&presets[p])el.value=presets[p];
}
function toggleRegexFlag(id){$(id)?.classList.toggle('on')}

/* ═══════════════════════════════════════
   CALCULATOR
═══════════════════════════════════════ */
let calcHistory=[];
function calcEval(){
  const expr=$('calcIn')?.value||'';
  try{
    const sanitized=expr.replace(/[^0-9+\-*/.()%^, a-zA-Z]/g,'');
    const result=Function('"use strict";return ('+sanitized+')')();
    $('calcResult').textContent=result;
    if(typeof result==='number'&&Number.isFinite(result)){
      $('calcHex').textContent='0x'+Math.round(result).toString(16).toUpperCase();
      $('calcOct').textContent='0o'+Math.round(result).toString(8);
      $('calcBin').textContent='0b'+Math.round(result).toString(2);
    }
    calcHistory.unshift({expr,result:String(result)});if(calcHistory.length>20)calcHistory.pop();renderCalcHist();
  }catch(e){$('calcResult').textContent='// error'}
}
function renderCalcHist(){const el=$('calcHist');if(!el)return;el.innerHTML=calcHistory.map(h=>'<div class="calc-item" onclick="$(\'calcIn\').value=\''+h.expr.replace(/'/g,"\\'")+'\';calcEval()"><span>'+esc(h.expr)+'</span><span style="color:var(--am)">'+esc(h.result)+'</span></div>').join('')}
function calcCopy(){const el=$('calcResult');if(el){navigator.clipboard.writeText(el.textContent).catch(()=>{});toast('// copied')}}

/* ═══════════════════════════════════════
   STOPWATCH
═══════════════════════════════════════ */
let swRunning=false,swStart=0,swElapsed=0,swRaf=null,swLaps=[];
function updSw(){
  const t=swRunning?swElapsed+(Date.now()-swStart):swElapsed;
  const ms=t%1000,s=Math.floor(t/1000)%60,m=Math.floor(t/60000)%60,h=Math.floor(t/3600000);
  $('swDisplay').innerHTML=(h>0?String(h).padStart(2,'0')+':':'')+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+'<span class="sw-ms">.'+String(Math.floor(ms/10)).padStart(2,'0')+'</span>';
  if(swRunning)swRaf=requestAnimationFrame(updSw);
}
function swToggle(){
  if(swRunning){swElapsed+=Date.now()-swStart;swRunning=false;cancelAnimationFrame(swRaf);$('swBtn').textContent='START'}
  else{swStart=Date.now();swRunning=true;$('swBtn').textContent='STOP';updSw()}
}
function swReset(){swRunning=false;swElapsed=0;swLaps=[];cancelAnimationFrame(swRaf);$('swBtn').textContent='START';updSw();$('swLapList').innerHTML=''}
function swLap(){
  if(!swRunning)return;const t=swElapsed+(Date.now()-swStart);
  const prev=swLaps.length>0?swLaps[swLaps.length-1].t:0;const delta=t-prev;
  swLaps.push({t,delta});renderSwLaps();
}
function renderSwLaps(){
  const el=$('swLapList');if(!el)return;
  el.innerHTML=swLaps.map((l,i)=>{const fmtMs=t=>{const s=Math.floor(t/1000)%60,m=Math.floor(t/60000),ms=Math.floor((t%1000)/10);return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+'.'+String(ms).padStart(2,'0')};return'<div class="sw-lap"><span class="sw-lap-num">LAP '+(i+1)+'</span><span>'+fmtMs(l.delta)+'</span><span>'+fmtMs(l.t)+'</span></div>'}).reverse().join('');
}

/* ═══════════════════════════════════════
   HTTP STATUS CODES
═══════════════════════════════════════ */
const HTTP_CODES=[
  {c:100,n:'Continue',d:'Server received request headers, client should proceed'},
  {c:101,n:'Switching Protocols',d:'Server switching to requested protocol'},
  {c:200,n:'OK',d:'Request succeeded'},
  {c:201,n:'Created',d:'Resource successfully created'},
  {c:202,n:'Accepted',d:'Request accepted for processing'},
  {c:204,n:'No Content',d:'Success with no response body'},
  {c:206,n:'Partial Content',d:'Partial resource returned (range request)'},
  {c:301,n:'Moved Permanently',d:'Resource permanently moved to new URL'},
  {c:302,n:'Found',d:'Resource temporarily at different URL'},
  {c:304,n:'Not Modified',d:'Resource not changed since last request'},
  {c:307,n:'Temporary Redirect',d:'Temporary redirect preserving method'},
  {c:308,n:'Permanent Redirect',d:'Permanent redirect preserving method'},
  {c:400,n:'Bad Request',d:'Server cannot process malformed request'},
  {c:401,n:'Unauthorized',d:'Authentication required'},
  {c:403,n:'Forbidden',d:'Server refuses to authorize request'},
  {c:404,n:'Not Found',d:'Resource does not exist'},
  {c:405,n:'Method Not Allowed',d:'HTTP method not supported for this resource'},
  {c:408,n:'Request Timeout',d:'Server timed out waiting for request'},
  {c:409,n:'Conflict',d:'Request conflicts with current server state'},
  {c:410,n:'Gone',d:'Resource permanently deleted'},
  {c:413,n:'Payload Too Large',d:'Request body exceeds server limits'},
  {c:415,n:'Unsupported Media Type',d:'Media type not supported'},
  {c:418,n:"I'm a Teapot",d:'RFC 2324 easter egg'},
  {c:422,n:'Unprocessable Entity',d:'Request well-formed but semantically invalid'},
  {c:429,n:'Too Many Requests',d:'Rate limit exceeded'},
  {c:500,n:'Internal Server Error',d:'Generic server error'},
  {c:501,n:'Not Implemented',d:'Server does not support the functionality'},
  {c:502,n:'Bad Gateway',d:'Invalid response from upstream server'},
  {c:503,n:'Service Unavailable',d:'Server temporarily unavailable'},
  {c:504,n:'Gateway Timeout',d:'Upstream server timed out'},
];
function renderHttpCodes(filter){
  const el=$('httpList');if(!el)return;
  const f=(filter||'').toLowerCase();
  const filtered=f?HTTP_CODES.filter(h=>String(h.c).includes(f)||h.n.toLowerCase().includes(f)||h.d.toLowerCase().includes(f)):HTTP_CODES;
  el.innerHTML=filtered.map(h=>{const cat=h.c<200?'c1':h.c<300?'c2':h.c<400?'c3':h.c<500?'c4':'c5';return'<div class="http-item" onclick="navigator.clipboard.writeText(\''+h.c+' '+h.n+'\');toast(\'// copied\')"><span class="http-code '+cat+'">'+h.c+'</span><div><div class="http-desc">'+h.n+'</div><div class="http-detail">'+h.d+'</div></div></div>'}).join('')||'<div style="padding:10px;color:var(--dim);font-size:10px;font-weight:700">// no matches</div>';
}
renderHttpCodes();

/* ═══════════════════════════════════════
   CASE CONVERTER
═══════════════════════════════════════ */
function convertCase(){
  const v=$('caseIn')?.value||'';if(!v.trim())return;
  const words=v.trim().split(/[\s_\-]+/).filter(Boolean);
  const cases={
    camelCase:words.map((w,i)=>i===0?w.toLowerCase():w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(''),
    PascalCase:words.map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(''),
    snake_case:words.map(w=>w.toLowerCase()).join('_'),
    SCREAMING_SNAKE:words.map(w=>w.toUpperCase()).join('_'),
    'kebab-case':words.map(w=>w.toLowerCase()).join('-'),
    'Title Case':words.map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(' '),
    UPPERCASE:v.toUpperCase(),
    lowercase:v.toLowerCase(),
  };
  const el=$('caseGrid');if(!el)return;
  el.innerHTML=Object.entries(cases).map(([k,val])=>'<div class="case-item" onclick="navigator.clipboard.writeText(this.querySelector(\'.case-val\').textContent);toast(\'// copied\')"><div class="case-lbl">'+k+'</div><div class="case-val">'+esc(val)+'</div></div>').join('');
}

/* ═══════════════════════════════════════
   MARKDOWN PREVIEW
═══════════════════════════════════════ */
function updMarkdown(){
  const v=$('mdIn')?.value||'',out=$('mdPreview');if(!out)return;
  let html=v;
  html=html.replace(/```(\w*)\n([\s\S]*?)```/g,(m,lang,code)=>'<pre><code>'+esc(code)+'</code></pre>');
  html=html.replace(/`([^`]+)`/g,'<code>$1</code>');
  html=html.replace(/^### (.+)$/gm,'<h3>$1</h3>');
  html=html.replace(/^## (.+)$/gm,'<h2>$1</h2>');
  html=html.replace(/^# (.+)$/gm,'<h1>$1</h1>');
  html=html.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
  html=html.replace(/\*(.+?)\*/g,'<em>$1</em>');
  html=html.replace(/^> (.+)$/gm,'<blockquote>$1</blockquote>');
  html=html.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank">$1</a>');
  html=html.replace(/^[-*] (.+)$/gm,'<li>$1</li>');
  html=html.replace(/(<li>.*<\/li>)/s,m=>'<ul>'+m+'</ul>');
  html=html.replace(/^---$/gm,'<hr style="border:none;border-top:1px solid var(--bdr);margin:8px 0">');
  html=html.replace(/\n\n/g,'<br><br>');
  html=html.replace(/\n/g,'<br>');
  out.innerHTML=html;
}
function mdCopyHtml(){const el=$('mdPreview');if(el){navigator.clipboard.writeText(el.innerHTML).catch(()=>{});toast('// HTML copied')}}
document.addEventListener('DOMContentLoaded',()=>{const el=$('mdIn');if(el)el.addEventListener('input',updMarkdown)});
