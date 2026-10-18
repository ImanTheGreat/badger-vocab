/*
  Badger Vocab: app logic
  Copyright (c) 2026 Iman Lloyd. Licensed under the PolyForm Noncommercial License 1.0.0 (see LICENSE.md).
  Required Notice: Copyright (c) 2026 Iman Lloyd. Badger Vocab was made by Iman Lloyd as a gift to the University of Wisconsin-Madison Language Department.

  Map of this file:
    tl()          Arabic → Latin pronunciation (used when you leave pronunciation blank)
    LANGS         the language list (add a line here to add a built-in language)
    storage       everything is saved in the browser's localStorage under "vocabGame"
    sound         Google voice when online, device voice otherwise
    routing       #           home (language menu)
                  #ar         Arabic groups
                  #ar/play    practice (matching or flashcards)
    my words      adding, deleting and grouping your own words
    practice      matching game, then flashcards
*/
const CM={"ب":"b","ت":"t","ث":"th","ج":"j","ح":"ḥ","خ":"kh","د":"d","ذ":"dh","ر":"r","ز":"z","س":"s","ش":"sh","ص":"ṣ","ض":"ḍ","ط":"ṭ","ظ":"ẓ","ع":"ʿ","غ":"gh","ف":"f","ق":"q","ك":"k","ل":"l","م":"m","ن":"n","ه":"h","ء":"ʾ","أ":"ʾ","إ":"ʾ","ؤ":"ʾ","ئ":"ʾ","پ":"p","ڤ":"v","گ":"g","چ":"ch"};
const VM={"َ":"a","ُ":"u","ِ":"i","ً":"an","ٌ":"un","ٍ":"in"};
function tl(s){
  if(s.replace(/[\u064B-\u0652\u0670\u0640]/g,"").trim()==="الله")return "allāh";
  const U=[];
  for(const c of [...s.normalize("NFC")]){
    if(/[\u064B-\u0652\u0670]/.test(c)){if(U.length)U[U.length-1].m.push(c)}
    else if(c!=="\u0640")U.push({c,m:[]});
  }
  let r="";const L={a:"ā",u:"ū",i:"ī"};
  const long=()=>{const l=r.slice(-1);if(L[l]&&!/(an|un|in)$/.test(r)){r=r.slice(0,-1)+L[l];return true}return false};
  for(let k=0;k<U.length;k++){
    const {c,m}=U[k],nx=U[k+1],pv=U[k-1];
    const sh=m.includes("\u0651"),sk=m.includes("\u0652"),da=m.includes("\u0670");
    const v=m.map(x=>VM[x]).filter(Boolean)[0]||"";
    const start=k===0||pv.c===" ";
    if(c===" "){r+=" ";continue}
    if(c==="ا"||c==="ٱ"){
      if(start)r+=v||"a";
      else if(pv.m.includes("\u064B"))continue;
      else if(v==="an"){r+=r.slice(-1)==="a"?"n":"an";continue}
      else if(!long())r+="ā";
      continue;
    }
    if(c==="آ"){r+="ʾā";continue}
    if(c==="ى"){if(!long())r+="ā";continue}
    if(c==="ة"){r+=(v||sk)?"t"+v:(r.slice(-1)==="a"?"":"a");continue}
    if(c==="ل"&&k>=1&&pv.c==="ا"&&(k===1||U[k-2].c===" ")&&!v&&!sh){r+="l-";continue}
    if(c==="و"||c==="ي"){
      const w=c==="و",lw=w?"u":"i";
      if(!v&&!sk&&!sh&&nx&&nx.c==="ة"&&!start){r+=r.slice(-1)==="i"?"y":"iy";continue}
      if(!v&&!sk&&!sh&&start&&w&&nx){r+="wa";continue}
      if(!v&&!sk&&!sh&&!start){
        if(r.slice(-1)===lw){long();continue}
        if(!/[aāuūiī]$/.test(r)){r+=w?"ū":"ī";continue}
      }
      const b=w?"w":"y";r+=(sh?b+b:b)+v;
      if(da)long();
      continue;
    }
    const b=CM[c]||c;
    r+=(sh?b+b:b)+(v||(start&&(c==="أ"||c==="إ")?(c==="أ"?"a":"i"):""));
    if(da&&!long())r+="ā";
  }
  return r.replace(/(^| )ʾ/g,"$1").replace(/\s+/g," ").trim();
}

/* ---------- helpers ---------- */
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const strip=s=>s.replace(/[ً-ْٰ֑-ׇֽֿׁׂׅׄ]/g,"");
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};

/* code, name, native name, Google TTS code, device voice code, right-to-left, arabic script */
const LANGS=[
["ar","Arabic","العربية","ar","ar",1,1],["es","Spanish","Español","es","es"],["fr","French","Français","fr","fr"],
["zh","Chinese (Mandarin)","中文","zh-CN","zh-CN"],["en","English","English","en","en"],["de","German","Deutsch","de","de"],
["it","Italian","Italiano","it","it"],["pt","Portuguese","Português","pt","pt"],["ja","Japanese","日本語","ja","ja"],
["ko","Korean","한국어","ko","ko"],["ru","Russian","Русский","ru","ru"],["hi","Hindi","हिन्दी","hi","hi"],
["tr","Turkish","Türkçe","tr","tr"],["he","Hebrew (Modern)","עברית","iw","he",1],["fa","Persian","فارسی","fa","fa",1,1],
["ur","Urdu","اردو","ur","ur",1,1],["el","Greek","Ελληνικά","el","el"],["nl","Dutch","Nederlands","nl","nl"],
["sv","Swedish","Svenska","sv","sv"],["pl","Polish","Polski","pl","pl"],["uk","Ukrainian","Українська","uk","uk"],
["vi","Vietnamese","Tiếng Việt","vi","vi"],["th","Thai","ไทย","th","th"],["id","Indonesian","Bahasa Indonesia","id","id"],
["sw","Swahili","Kiswahili","sw","sw"],["tl","Tagalog","Tagalog","tl","fil"],["yue","Cantonese","粵語","yue","zh-HK"],
["bn","Bengali","বাংলা","bn","bn"],["pa","Punjabi","ਪੰਜਾਬੀ","pa","pa"],["ga","Irish","Gaeilge","ga","ga"],
["la","Latin","Latina","la","la"],
// Added to match the UW-Madison language list. Indigenous languages have no Google or device voice,
// so read-aloud is turned off for them (tts and device code left blank) and the pronunciation field matters more.
["da","Danish","Dansk","da","da"],["fi","Finnish","Suomi","fi","fi"],["ha","Hausa","Hausa","ha","ha"],
["hmn","Hmong","Hmoob","hmn",""],["is","Icelandic","Íslenska","is","is"],["kk","Kazakh","Қазақ тілі","kk","kk"],
["no","Norwegian","Norsk","no","nb"],["so","Somali","Soomaali","so","so"],["bo","Tibetan","བོད་སྐད།","bo",""],
["yi","Yiddish","ייִדיש","yi","yi",1],["yo","Yoruba","Yorùbá","yo","yo"],["zu","Zulu","isiZulu","zu","zu"],
["dak","Dakota","Dakȟótiyapi","",""],["win","Ho-Chunk","Hoocąk","",""],["mez","Menominee","Menominee","",""],
["oj","Ojibwe","Anishinaabemowin","",""],["one","Oneida","Oneida","",""]].map(a=>({c:a[0],n:a[1],nat:a[2],tts:a[3],dev:a[4],rtl:!!a[5],arab:!!a[6]}));
const VERSION="1.0";
// Built-in word lists. The Arabic list lives in data/arabic-words.js; if that file is left out, Arabic simply starts empty.
const BUILT=typeof D!=="undefined"?{ar:D}:{};
const MARKS=new Set(["ar","fa","ur","he","yi"]);

/* ---------- storage ---------- */
const KEY="vocabGame";
let S={langs:{},o:{},custom:[]};
const LS=c=>S.langs[c]||(S.langs[c]={lv:{},mine:[]});
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
function fromOld(old){const a=LS("ar");Object.assign(a.lv,old.lv||{});a.mine=(a.mine||[]).concat((old.mine||[]).map(m=>({w:m.ar,en:m.en,tr:m.tr||"",g:m.g||"My words"})))}
try{const x=JSON.parse(localStorage.getItem(KEY)||"null");if(x)S=Object.assign(S,x)}catch(e){}
try{const old=JSON.parse(localStorage.getItem("arabicMatch")||"null");if(old&&!S.migrated){fromOld(old);S.migrated=1;save()}}catch(e){}
const DEF={fc:"20",ford:"mix",n:8,focus:"mix",mode:"match",dir:"t",hk:true,tr:true,auto:true,snd:"google"};S.o=Object.assign({},DEF,S.o);

const allLangs=()=>LANGS.concat((S.custom||[]).map(x=>({c:x.c,n:x.n,nat:x.n,tts:x.tts,dev:x.tts||"",rtl:!!x.rtl,arab:false,custom:1})));
const findLang=c=>allLangs().find(l=>l.c===c);
const count=c=>(BUILT[c]?BUILT[c].w.length:0)+((S.langs[c]||{}).mine||[]).length;

/* ---------- current language ---------- */
let cur=null;const bCache={};
function openLang(c){
 const l=findLang(c),b=BUILT[c];
 if(b&&!bCache[c])bCache[c]=b.w.map(w=>[w[0],c==="ar"?tl(w[0]):"",w[1],w[2]||""]);
 const B=bCache[c]||[];
 const M=LS(c).mine.map(m=>[m.w,m.tr||(c==="ar"?tl(m.w):""),m.en,""]);
 cur={c,l,W:B.concat(M),nb:B.length,cats:b?b.c:[],cat:LS(c).cat||null};
 document.body.classList.toggle("arab",l.arab);
}
const W=i=>cur.W[i];
const key=i=>cur.free?"c:"+W(i)[6]:W(i)[0]+"|"+W(i)[2].split("; ")[0];
const lvl=i=>LS(cur.c).lv[key(i)]||0;
const setLv=(i,l)=>{const lv=LS(cur.c).lv;if(l)lv[key(i)]=l;else delete lv[key(i)];save()};
const eng=i=>cur.free?W(i)[2]:W(i)[2].split("; ").slice(0,2).join("; ");
const disp=i=>(MARKS.has(cur.c)&&!S.o.hk)?strip(W(i)[0]):W(i)[0];
const tAttr=()=>cur.free?`dir="auto"${cur.l.tts?` lang="${esc(cur.l.tts)}"`:""}`:`lang="${esc(cur.l.tts||cur.c)}" dir="${cur.l.rtl?"rtl":"ltr"}"`;
// A picture placeholder; free.js fills in the image from the device’s picture storage.
const img=(id,cls)=>id?`<img class="${cls}" data-img="${esc(id)}" alt="">`:"";

function pool(cat){
 if(cat==="*")return cur.W.map((_,i)=>i);
 if(cat[0]==="m"){const g=cat.slice(2);return LS(cur.c).mine.map((m,k)=>[m,k]).filter(([m])=>g==="*"||m.g===g).map(([,k])=>cur.nb+k)}
 const c=cur.cats[+cat];return c?c[2]:[];
}
function catName(cat){if(cat==="*")return "Everything";if(cat==="m:*")return "All my words";if(cat[0]==="m")return cat.slice(2);const c=cur.cats[+cat];return c?c[1]:""}
function choose(n,dedupe=true){
 const f=S.o.focus,WT=[3,4,2,.5];let L=pool(cur.cat);
 if(f!=="mix")L=L.filter(i=>lvl(i)===+f);
 const sc=L.map(i=>[-Math.log(Math.random())/(f==="mix"?WT[lvl(i)]:1),i]).sort((a,b)=>a[0]-b[0]);
 const out=[],ua=new Set(),ue=new Set();
 for(const[,i]of sc){if(dedupe){const a=cur.free?(W(i)[0]||"#"+i):strip(W(i)[0]),e=cur.free?(W(i)[2]||"#"+i):eng(i);if(ua.has(a)||ue.has(e))continue;ua.add(a);ue.add(e)}out.push(i);if(out.length>=n)break}
 return out;
}

/* ---------- sound ---------- */
let aud=null;
function device(t){
 if(!("speechSynthesis" in window)){note(true);return}
 speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t),dc=(cur.l.dev||cur.c).toLowerCase();
 u.lang=cur.l.dev||cur.c;u.rate=.85;
 const vs=speechSynthesis.getVoices(),v=vs.find(v=>v.lang.toLowerCase().replace("_","-")===dc)||vs.find(v=>v.lang.toLowerCase().startsWith(dc.split("-")[0]));
 if(v)u.voice=v;else if(vs.length)note(true);
 speechSynthesis.speak(u);
}
function note(on){$("vnote").hidden=!on;$("vnote").textContent=`No ${cur?cur.l.n:""} voice was found on this device, so the word may be read with the wrong accent. Try the Google voice while online, or add a voice in your system’s speech settings.`}
function say(t){
 const m=S.o.snd;if(m==="off"||!t)return;
 if(cur.free&&!cur.l.tts&&!cur.l.dev)return;
 if(!cur.l.tts&&!cur.l.dev){$("vnote").hidden=false;$("vnote").textContent=`Read-aloud isn’t available for ${cur.l.n} yet, because no Google or device voice exists for it. Adding a pronunciation spelling to your words helps instead.`;return}
 if(m==="google"&&cur.l.tts&&navigator.onLine){
  try{if(aud)aud.pause();if("speechSynthesis" in window)speechSynthesis.cancel();
   aud=new Audio("https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl="+encodeURIComponent(cur.l.tts)+"&q="+encodeURIComponent(t.slice(0,190)));
   let fell=false;const fb=()=>{if(!fell){fell=true;device(t)}};
   aud.onerror=fb;const p=aud.play();if(p)p.catch(e=>{if(e&&e.name!=="AbortError")fb()});return;
  }catch(e){}
 }
 device(t);
}
if("speechSynthesis" in window)speechSynthesis.onvoiceschanged=()=>{};

/* ---------- views & routing ---------- */
function show(v){["vStart","vHome","vLang","vPlay","vAbout","vFree","vDeck","vBreak","vSudoku","vChess"].forEach(id=>$(id).hidden=id!==v);window.scrollTo(0,0)}
function go(h){location.hash=h}
function route(){
 const parts=decodeURIComponent(location.hash.slice(1)).split("/"),[c,p]=parts;
 if(c!=="free"&&!findLang(c))document.body.classList.remove("arab");
 if(c==="about"){document.title="About · Badger Vocab";show("vAbout");renderAbout();return}
 if(c==="free")return routeFree(parts);            // Free Learn lives in free.js
 if(c==="break")return routeBreak(parts);          // Study Break lives in break.js
 if(c==="languages"){show("vHome");renderHome();return}
 if(!c||!findLang(c)){if(c)history.replaceState(null,"","#");show("vStart");renderStart();return}
 if(!cur||cur.c!==c)openLang(c);
 if(p==="play"&&cur.cat!=null&&pool(cur.cat).length){show("vPlay");startPlay()}
 else{if(p==="play"){history.replaceState(null,"","#"+c)}show("vLang");renderLang()}
}
window.addEventListener("hashchange",route);
function renderAbout(){
 $("ver").textContent=VERSION;
 $("aboutList").textContent=BUILT.ar?`This copy includes the built-in Arabic frequency list (${BUILT.ar.w.length.toLocaleString()} words).`:"This copy does not include a built-in word list. Add your own words in any language.";
}
document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));
$("toGroups").onclick=()=>go(cur.free?"free/"+cur.deck.id:cur.c);

/* ---------- home ---------- */
function lcard(l){const n=count(l.c);return `<button class="lc${n?" has":""}" data-c="${esc(l.c)}"><span class="ln">${esc(l.n)}</span><span class="lnat" lang="${esc(l.tts||l.c)}" dir="${l.rtl?"rtl":"ltr"}">${esc(l.nat)}</span><span class="lcount">${n?n.toLocaleString()+" words":"No words yet"}</span></button>`}
function renderHome(){
 document.title="Badger Vocab";
 const A=allLangs(),mine=A.filter(l=>count(l.c)),rest=A.filter(l=>!count(l.c)).sort((a,b)=>a.n.localeCompare(b.n));
 $("homeMine").innerHTML=mine.length?`<h2>Your languages</h2><div class="lgrid">${mine.map(lcard).join("")}</div>`:"";
 $("moreH").textContent=mine.length?"Start a new language":"Languages";
 $("langs").innerHTML=rest.map(lcard).join("");
 document.querySelectorAll(".lc").forEach(b=>b.onclick=()=>go(b.dataset.c));
 renderCustom();
}
$("clAdd").onclick=()=>{
 const n=$("clName").value.trim(),t=$("clCode").value.trim();
 if(!n){$("clMsg").textContent="Enter a language name.";return}
 const c="x-"+n.toLowerCase().replace(/[^a-z0-9]+/g,"-");
 if(findLang(c)){$("clMsg").textContent="That language is already here.";return}
 (S.custom=S.custom||[]).push({c,n,tts:t,rtl:$("clRtl").checked});save();
 $("clName").value=$("clCode").value="";$("clMsg").textContent=n+" added.";renderHome();
};
function renderCustom(){
 const box=$("clList");box.innerHTML="";
 (S.custom||[]).forEach((x,k)=>{const d=document.createElement("div");d.className="gm";
  d.innerHTML=`<span>${esc(x.n)}<small>${count(x.c)} words</small></span>`;
  const b=document.createElement("button");b.className="btn danger sm";b.textContent="Remove language";
  b.onclick=()=>{if(!confirm(`Remove ${x.n} and all ${count(x.c)} of its words? This can’t be undone.`))return;
   S.custom.splice(k,1);delete S.langs[x.c];save();$("clMsg").textContent=x.n+" removed.";renderHome()};
  d.appendChild(b);box.appendChild(d)});
}
$("exp").onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:"application/json"}));a.download="badger-vocab-backup.json";a.click()};
$("imp").onchange=e=>{const f=e.target.files[0];if(f)f.text().then(x=>{try{const j=JSON.parse(x);
 if(j.langs){S=Object.assign({langs:{},o:{},custom:[]},j)}else if(j.lv||j.mine){fromOld(j)}else throw 0;
 S.o=Object.assign({},DEF,S.o);S.migrated=1;save();cur=null;$("bMsg").textContent="Backup imported.";applyTheme();route()}catch(err){$("bMsg").textContent="That file couldn’t be read."}})};

/* ---------- language / groups ---------- */
function gcard(cat,title){
 const P=pool(cat),c=[0,0,0,0];P.forEach(i=>c[lvl(i)]++);const n=P.length||1,p=k=>(c[k]/n*100).toFixed(1);
 return `<button class="g" data-cat="${esc(cat)}"><span class="gt">${esc(title)}</span><span class="gc">${P.length.toLocaleString()} word${P.length===1?"":"s"} · ${c[3]} known</span><span class="gb"><i class="k3" style="width:${p(3)}%"></i><i class="k2" style="width:${p(2)}%"></i><i class="k1" style="width:${p(1)}%"></i></span></button>`;
}
function renderLang(){
 const l=cur.l;document.title=l.n+" · Badger Vocab";
 $("lTitle").innerHTML=`${esc(l.n)} <span class="tgt" style="color:var(--muted);font-weight:600" ${tAttr()}>${esc(l.nat)}</span>`;
 const c=[0,0,0,0];cur.W.forEach((_,i)=>c[lvl(i)]++);
 $("lInfo").textContent=cur.W.length?`${cur.W.length.toLocaleString()} words · ${c[3]} know · ${c[2]} semi-know · ${c[1]} don’t know · ${c[0]} unrated`:"No words yet. Add some below to start practicing.";
 syncOpts();
 const M=LS(cur.c).mine;let h="";
 if(M.length){h+=`<h2>My words</h2><div class="ggrid">${M.length>0&&new Set(M.map(x=>x.g)).size>1?gcard("m:*","All my words"):""}${[...new Set(M.map(x=>x.g))].map(g=>gcard("m:"+g,g)).join("")}</div>`}
 if(cur.nb){
  h+=`<h2>All words</h2><div class="ggrid">${gcard("*","Everything")}</div>`;
  let sec="";cur.cats.forEach((k,i)=>{if(k[0]!==sec){if(sec)h+="</div>";h+=`<h2>${esc(k[0])}</h2><div class="ggrid">`;sec=k[0]}h+=gcard(String(i),k[1])});if(sec)h+="</div>";
 }
 if(!cur.W.length)h=`<div class="empty">There are no ${esc(l.n)} words saved yet. Open “Add my own words” below, add a few (put them in groups like “Food” or “Lesson 1”), and they’ll show up here as practice groups.</div>`;
 $("groups").innerHTML=h;
 document.querySelectorAll(".g").forEach(b=>b.onclick=()=>{cur.cat=b.dataset.cat;LS(cur.c).cat=cur.cat;save();go(cur.c+"/play")});
 $("faLbl").textContent=`Word in ${l.n}`;$("fa").setAttribute("lang",l.tts||l.c);$("fa").dir=l.rtl?"rtl":"ltr";$("bulk").dir="auto";
 $("ftLbl").textContent=cur.c==="ar"?"Pronunciation (optional, made automatically if blank)":"Pronunciation (optional)";
 $("mine").open=!cur.W.length;renderMine();
}
function syncOpts(){
 document.querySelectorAll(".seg button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.mode===S.o.mode));
 $("n").value=S.o.n;$("focus").value=S.o.focus;$("dir").value=S.o.dir;$("snd").value=S.o.snd;
 ["hk","tr","auto"].forEach(id=>$(id).checked=!!S.o[id]);
 const m=S.o.mode;$("ford").value=S.o.ford;document.querySelectorAll(".fcSel").forEach(s=>s.value=S.o.fc);
 $("hkWrap").hidden=!MARKS.has(cur.c);$("autoWrap").hidden=m!=="match";$("nWrap").hidden=m!=="match";
 ["dirWrap","fcWrap","ordWrap"].forEach(id=>$(id).hidden=m!=="cards");$("focusWrap").hidden=m==="list";
 document.querySelectorAll("[data-opt]").forEach(el=>el.value=S.o[el.dataset.opt]);
 document.querySelectorAll("[data-show]").forEach(el=>{const s=el.dataset.show;el.hidden=s==="notlist"?m==="list":s!==m});
 document.querySelectorAll('.seg button[data-mode="list"]').forEach(b=>b.textContent=cur&&cur.free?"Card list":"Word list");
}
document.querySelectorAll("[data-opt]").forEach(el=>el.onchange=()=>{const k=el.dataset.opt;let v=el.value;
 if(k==="n")v=Math.max(3,Math.min(25,+v||8));S.o[k]=v;save();syncOpts()});
const FC=["5","10","15","20","25","30","40","50","75","100","all"];
document.querySelectorAll(".fcSel").forEach(s=>{s.innerHTML=FC.map(v=>`<option value="${v}">${v==="all"?"Whole group":v+" cards"}</option>`).join("");
 s.onchange=()=>{S.o.fc=s.value;save();syncOpts();if(s.id==="fc2")newDeck()}});
$("ford").onchange=()=>{S.o.ford=$("ford").value;save()};
document.querySelectorAll(".seg button").forEach(b=>b.onclick=()=>{b.blur();S.o.mode=b.dataset.mode;save();syncOpts();if(!$("vPlay").hidden)startPlay()});
$("n").onchange=()=>{S.o.n=Math.max(3,Math.min(25,+$("n").value||8));$("n").value=S.o.n;save()};
["focus","dir","snd"].forEach(id=>$(id).onchange=()=>{S.o[id]=$(id).value;save()});
["hk","tr","auto"].forEach(id=>$(id).onchange=()=>{S.o[id]=$(id).checked;save()});

/* my words */
function addWord(w,en,tr,g){w=w.trim();en=en.trim();if(!w||!en)return false;LS(cur.c).mine.push({w,en,tr:(tr||"").trim(),g:(g||"").trim()||"My words"});return true}
function renderMine(){
 const m=LS(cur.c).mine,box=$("mlist");box.innerHTML="";
 m.forEach((w,k)=>{const d=document.createElement("div");d.className="w";
  d.innerHTML=`<div><span class="tw" ${tAttr()}>${esc(w.w)}</span> <span class="en">${w.tr?esc(w.tr)+" · ":""}${esc(w.en)} · ${esc(w.g)}</span></div>`;
  const b=document.createElement("button");b.className="btn alt sm";b.textContent="Delete";
  b.onclick=()=>{m.splice(k,1);afterMine("Deleted.")};d.appendChild(b);box.appendChild(d)});
 const groups=[...new Set(m.map(x=>x.g))];
 $("glist").innerHTML=groups.map(g=>`<option value="${esc(g)}">`).join("");
 const gb=$("gBox");gb.innerHTML=groups.length?'<h3 class="sm">My groups</h3>':"";
 groups.forEach(g=>{const n=m.filter(x=>x.g===g).length,d=document.createElement("div");d.className="gm";
  d.innerHTML=`<span>${esc(g)}<small>${n} word${n===1?"":"s"}</small></span>`;
  const bt=document.createElement("div");bt.className="lv";
  const r=document.createElement("button");r.className="btn alt sm";r.textContent="Rename";
  r.onclick=()=>{const nn=(prompt(`New name for “${g}”:`,g)||"").trim();if(!nn||nn===g)return;
   m.forEach(x=>{if(x.g===g)x.g=nn});if(cur.cat==="m:"+g){cur.cat="m:"+nn;LS(cur.c).cat=cur.cat}afterMine(`Renamed to “${nn}”.`)};
  const del=document.createElement("button");del.className="btn danger sm";del.textContent="Delete group";
  del.onclick=()=>{if(!confirm(`Delete the group “${g}” and its ${n} word${n===1?"":"s"}? This can’t be undone.`))return;
   LS(cur.c).mine=m.filter(x=>x.g!==g);if(cur.cat==="m:"+g){cur.cat=null;LS(cur.c).cat=null}afterMine(`Deleted “${g}”.`)};
  bt.append(r,del);d.appendChild(bt);gb.appendChild(d)});
 if(m.length)gb.insertAdjacentHTML("beforeend",'<h3 class="sm">My words</h3>');
}
function afterMine(t){save();const o=$("mine").open;openLang(cur.c);renderLang();$("mine").open=o||true;$("mmsg").textContent=t}
$("addb").onclick=()=>{if(addWord($("fa").value,$("fe").value,$("ft").value,$("fg").value)){$("fa").value=$("fe").value=$("ft").value="";afterMine("Added.");$("fa").focus()}else $("mmsg").textContent="Enter both the word and its meaning."};
$("bulkb").onclick=()=>{let n=0;$("bulk").value.split("\n").forEach(l=>{
  const p=l.includes("\t")?l.split("\t"):l.split(":");if(p.length<2)return;
  const tr=p.length>=3?p[2]:"";if(addWord(p[0],p[1],tr,$("fg").value))n++});
 $("bulk").value="";afterMine(n+" added.")};

/* ---------- practice ---------- */
function startPlay(){
 syncOpts();$("vnote").hidden=true;
 $("pTitle").textContent=cur.free?`Free Learn · ${cur.l.n}`:`${cur.l.n} · ${catName(cur.cat)}`;
 $("hear").hidden=!!cur.free&&!cur.l.tts&&!cur.l.dev;
 $("toGroups").textContent=cur.free?"← Deck":"← Groups";$("tapHint").hidden=$("hear").hidden;document.title=$("pTitle").textContent;
 const m=S.o.mode;$("mView").hidden=m!=="match";$("fView").hidden=m!=="cards";$("lView").hidden=m!=="list";
 if(m==="cards")newDeck();else if(m==="list")newList();else newRound();
}

/* matching */
let pairs=[],sel=null,done=0,mistakes=0,missed=new Set();
function newRound(){
 pairs=choose(Math.min(S.o.n,25));missed=new Set();sel=null;done=0;mistakes=0;$("end").hidden=true;render();
 if(!pairs.length)$("board").innerHTML='<p class="sub">No words match this “Show me” setting in this group. Go back and choose “Mix”, or rate some words first.</p>';
}
function render(){
 const b=$("board");b.innerHTML="";
 const L=document.createElement("div"),R=document.createElement("div");L.className=R.className="col";
 shuffle(pairs).forEach(i=>{
  const t=document.createElement("button");t.className="tile tgt";t.dataset.side="a";t.dataset.id=i;
  t.setAttribute("lang",cur.l.tts||cur.c);t.dir=cur.l.rtl?"rtl":"ltr";
  t.innerHTML=`${img(W(i)[4],"timg")}${W(i)[0]?`<span>${esc(disp(i))}</span>`:""}${S.o.tr&&W(i)[1]?`<small>${esc(W(i)[1])}</small>`:""}`;
  t.onclick=()=>{say(W(i)[0]);pick(t)};L.appendChild(t);
 });
 shuffle(pairs).forEach(i=>{const t=document.createElement("button");t.className="tile";t.dataset.side="e";t.dataset.id=i;t.innerHTML=`${img(W(i)[5],"timg")}${esc(eng(i))}`;t.onclick=()=>pick(t);R.appendChild(t)});
 b.append(L,R);stat();
}
function stat(){$("stat").textContent=`${done} of ${pairs.length} matched · ${mistakes} miss${mistakes===1?"":"es"}`;$("prog").style.width=(pairs.length?done/pairs.length*100:0)+"%"}
function pick(t){
 if(t.classList.contains("done"))return;
 if(sel&&sel.dataset.side===t.dataset.side){sel.classList.remove("sel");sel=sel===t?null:t;if(sel)t.classList.add("sel");return}
 if(!sel){sel=t;t.classList.add("sel");return}
 const a=sel,b=t;a.classList.remove("sel");sel=null;
 if(a.dataset.id===b.dataset.id){[a,b].forEach(x=>x.classList.add("done"));done++;stat();if(done===pairs.length)finish()}
 else{mistakes++;missed.add(+a.dataset.id);missed.add(+b.dataset.id);[a,b].forEach(x=>{x.classList.add("bad");setTimeout(()=>x.classList.remove("bad"),400)});stat()}
}
function rateRow(i){
 const g=document.createElement("div");g.className="lv";
 [["Don’t know",1],["Semi-know",2],["Know",3]].forEach(([n,l])=>{
  const b=document.createElement("button");b.textContent=n;b.className="l"+l;b.setAttribute("aria-pressed",lvl(i)===l);
  b.onclick=()=>{setLv(i,lvl(i)===l?0:l);[...g.children].forEach((c,k)=>c.setAttribute("aria-pressed",lvl(i)===k+1))};g.appendChild(b)});
 return g;
}
function wordRow(i){
 const d=document.createElement("div");d.className="w";
 d.innerHTML=`<div class="wr">${img(W(i)[4],"thumb")}${img(W(i)[5],"thumb")}<span class="tw" ${tAttr()}>${esc(W(i)[0])}</span> <span class="en">${W(i)[1]?esc(W(i)[1])+" · ":""}${esc(eng(i))}${W(i)[3]?" · "+esc(W(i)[3]):""}</span></div>`;
 d.appendChild(rateRow(i));return d;
}
function finish(){
 if(S.o.auto)missed.forEach(i=>{if(lvl(i)!==1)setLv(i,1)});
 const e=$("end");
 e.innerHTML=`<h3>${mistakes===0?"Perfect round":"Round complete"}</h3><p>${pairs.length} words, ${mistakes} miss${mistakes===1?"":"es"}. Rate each word to change how often it comes back.</p>`;
 pairs.forEach(i=>e.appendChild(wordRow(i)));
 const bt=document.createElement("div");bt.className="btns";
 bt.innerHTML='<button class="btn" id="next">Next round</button><button class="btn alt" id="again">Replay these words</button><button class="btn alt" id="asCards">Study these as flashcards</button>';
 e.appendChild(bt);e.hidden=false;
 $("next").onclick=newRound;
 $("again").onclick=()=>{missed=new Set();sel=null;done=0;mistakes=0;e.hidden=true;render()};
 $("asCards").onclick=()=>{const p=pairs.slice();S.o.mode="cards";save();syncOpts();$("mView").hidden=true;$("fView").hidden=false;newDeck(p)};
 $("next").focus();
}

/* flashcards */
let deck=[],fi=0,flipped=false,tally={1:[],2:[],3:[]};
let deckOff=0;
function deckPool(){let L=pool(cur.cat);const f=S.o.focus;if(f!=="mix")L=L.filter(i=>lvl(i)===+f);return L}
function deckList(off){
 const L=deckPool(),n=S.o.fc==="all"?L.length:+S.o.fc;
 if(S.o.ford==="list"){deckOff=off||0;if(deckOff>=L.length)deckOff=0;return L.slice(deckOff,deckOff+n)}
 return choose(n,false);
}
function newDeck(list,off){
 deck=list?shuffle(list):deckList(off);fi=0;tally={1:[],2:[],3:[]};
 $("fEnd").hidden=true;["card","flipRow","rateRow"].forEach(id=>$(id).hidden=false);
 if(!deck.length){$("card").hidden=$("flipRow").hidden=$("rateRow").hidden=true;$("fstat").textContent="No words match this “Show me” setting in this group.";$("fprog").style.width="0";return}
 showCard();
}
const sizeCls=s=>s.length>80?" longer":s.length>24?" long":"";
function wordSide(i){return `${img(W(i)[4],"cimg")}${W(i)[0]?`<div class="big${sizeCls(W(i)[0])}" ${tAttr()}>${esc(disp(i))}</div>`:""}${S.o.tr&&W(i)[1]?`<div class="pron">${esc(W(i)[1])}</div>`:""}`}
function meanSide(i){return `${img(W(i)[5],"cimg")}${W(i)[2]?`<div class="mean${W(i)[2].length>80?" longer":""}">${esc(W(i)[2])}</div>`:""}${W(i)[3]?`<div class="note">${esc(W(i)[3])}</div>`:""}`}
function showCard(){
 if(fi>=deck.length)return endDeck();
 const i=deck[fi],t2e=S.o.dir!=="e";flipped=false;
 $("card").classList.add("noanim");$("card").classList.remove("flip");void $("card").offsetWidth;setTimeout(()=>$("card").classList.remove("noanim"),20);
 $("ff").innerHTML=(t2e?wordSide(i):meanSide(i))+'<div class="hint">Tap to flip</div>';
 $("fb").innerHTML=t2e?meanSide(i)+(W(i)[0]&&!cur.free?`<div class="pron" ${tAttr()}>${esc(W(i)[0])}</div>`:""):wordSide(i)+(cur.free?"":`<div class="note">${esc(eng(i))}</div>`);
 $("flipRow").hidden=false;$("rateRow").hidden=true;
 $("fstat").textContent=`Card ${fi+1} of ${deck.length}`;$("fprog").style.width=(fi/deck.length*100)+"%";
 if(t2e)say(W(i)[0]);
}
function flip(){
 if($("fView").hidden||!$("fEnd").hidden||!deck.length)return;
 flipped=!flipped;$("card").classList.toggle("flip",flipped);
 if(flipped){$("flipRow").hidden=true;$("rateRow").hidden=false;if(S.o.dir==="e")say(W(deck[fi])[0])}
 else{$("flipRow").hidden=false;$("rateRow").hidden=true}
}
function rate(l){if(!flipped)return;const i=deck[fi];setLv(i,l);[1,2,3].forEach(k=>tally[k]=tally[k].filter(x=>x!==i));tally[l].push(i);fi++;showCard()}
$("card").onclick=flip;$("flipB").onclick=flip;
$("skipB").onclick=()=>{fi++;showCard()};
$("prevB").onclick=()=>{if(fi>0){fi--;showCard()}};
$("hear").onclick=()=>{if(deck[fi]!=null)say(W(deck[fi])[0])};
document.querySelectorAll("#rateRow button").forEach(b=>b.onclick=()=>rate(+b.dataset.r));
document.addEventListener("keydown",e=>{
 if($("vPlay").hidden||$("fView").hidden||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
 if(e.key===" "){e.preventDefault();flip()}
 else if("123".includes(e.key)&&e.key)rate(+e.key);
 else if(e.key==="ArrowLeft"&&$("fEnd").hidden&&fi>0){fi--;showCard()}
 else if(e.key==="ArrowRight"&&$("fEnd").hidden&&deck.length){fi++;showCard()}
});
function endDeck(){
 $("fprog").style.width="100%";["card","flipRow","rateRow"].forEach(id=>$(id).hidden=true);
 $("fstat").textContent="Deck finished";
 const e=$("fEnd"),k=tally[3].length,s=tally[2].length,d=tally[1].length;
 e.innerHTML=`<h3>Deck finished</h3><p>${k} know · ${s} semi-know · ${d} don’t know. You can still change any rating below.</p>`;
 if(deck.length>60){e.insertAdjacentHTML("beforeend",`<p>Showing the ${d+s} words you didn’t mark as known.</p>`);tally[1].concat(tally[2]).forEach(i=>e.appendChild(wordRow(i)))}
 else deck.forEach(i=>e.appendChild(wordRow(i)));
 const L=deckPool(),more=S.o.ford==="list"&&S.o.fc!=="all"&&deckOff+deck.length<L.length&&deck.length===+S.o.fc;
 const bt=document.createElement("div");bt.className="btns";
 bt.innerHTML=`${more?`<button class="btn" id="fCont">Next ${Math.min(+S.o.fc,L.length-deckOff-deck.length)} words</button>`:""}<button class="btn${more?" alt":""}" id="fNext">${S.o.ford==="list"?"Start over":"New deck"}</button>${d+s?`<button class="btn alt" id="fWeak">Review the ${d+s} I missed</button>`:""}<button class="btn alt" id="fMatch">Match these words</button>`;
 e.appendChild(bt);e.hidden=false;
 if(more)$("fCont").onclick=()=>newDeck(null,deckOff+deck.length);
 $("fNext").onclick=()=>newDeck();
 if($("fWeak"))$("fWeak").onclick=()=>newDeck(tally[1].concat(tally[2]));
 $("fMatch").onclick=()=>{const p=deck.slice(0,25);S.o.mode="match";save();syncOpts();$("mView").hidden=false;$("fView").hidden=true;
  pairs=p;missed=new Set();sel=null;done=0;mistakes=0;$("end").hidden=true;render()};
 ($("fCont")||$("fNext")).focus();
}

/* word list */
let lItems=[],lShown=0;const PAGE=100;
function newList(){$("lq").value="";$("lf").value="all";filterList()}
function filterList(){
 const q=$("lq").value.trim().toLowerCase(),qs=strip(q),f=$("lf").value;
 lItems=pool(cur.cat).filter(i=>(f==="all"||lvl(i)===+f)&&(!q||strip(W(i)[0]).toLowerCase().includes(qs)||W(i)[2].toLowerCase().includes(q)||W(i)[1].toLowerCase().includes(q)));
 lShown=0;$("lwords").innerHTML="";
 const tot=pool(cur.cat).length;
 $("lstat").textContent=lItems.length===tot?`${tot.toLocaleString()} words. Tap a word to hear it, and rate it right here.`:`${lItems.length.toLocaleString()} of ${tot.toLocaleString()} words match.`;
 moreList();
}
function listRow(i,n){
 const d=document.createElement("div");d.className="w lw";
 d.innerHTML=`<span class="ln">${n}</span><div class="lbody">${W(i)[4]||W(i)[5]?`<div class="lthumbs">${img(W(i)[4],"lthumb")}${img(W(i)[5],"lthumb")}</div>`:""}<button class="tw say" ${tAttr()}>${esc(disp(i))}</button>${S.o.tr&&W(i)[1]?` <span class="pron">${esc(W(i)[1])}</span>`:""}<div class="en">${esc(W(i)[2])}${W(i)[3]?` <span class="note">· ${esc(W(i)[3])}</span>`:""}</div></div>`;
 d.querySelector(".say").onclick=()=>say(W(i)[0]);
 d.appendChild(rateRow(i));return d;
}
function moreList(){
 const box=$("lwords"),end=Math.min(lShown+PAGE,lItems.length);
 for(let k=lShown;k<end;k++)box.appendChild(listRow(lItems[k],k+1));
 lShown=end;$("lmoreRow").hidden=lShown>=lItems.length;
 $("lmore").textContent=`Show more (${(lItems.length-lShown).toLocaleString()} left)`;
}
$("lmore").onclick=moreList;
let lqT;$("lq").oninput=()=>{clearTimeout(lqT);lqT=setTimeout(filterList,150)};$("lf").onchange=filterList;
// Load the next page automatically when the "Show more" button scrolls into view.
if("IntersectionObserver" in window)new IntersectionObserver(es=>{if(es[0].isIntersecting&&!$("lView").hidden&&!$("lmoreRow").hidden)moreList()},{rootMargin:"400px"}).observe($("lmoreRow"));

/* ---------- color theme ---------- */
// THEMES START: generated by themes.py
const THEMES=[["red","Badger Red","#A50034","#D50032"],["blue","Lake Blue","#123E80","#1F5FBF"],["teal","Teal","#0A5653","#0F7C78"],["purple","Purple","#4B2775","#6B3FA0"],["orange","Autumn Orange","#8A3A06","#B04D0E"],["slate","Slate","#2A3947","#4A6175"],["terrace","Terrace Sunburst","#9A3412","#C2410C"],["graphite","Graphite","#1A1A1A","#3A3A3A"],["contrast","High Contrast","#000000","#000000"],["forest","Forest Green","#1C5F38","#247B48"],["turquoise","Turquoise","#065D6B","#077788"],["sky","Sky Blue","#0A5A7F","#0D72A0"],["indigo","Indigo","#222577","#393EC6"],["rose","Rose","#7E1B34","#C62A51"],["berry","Berry","#7A1F59","#BC2F88"],["coral","Coral","#862413","#C4351C"],["sunflower","Sunflower","#6F4C06","#916308"],["moss","Moss","#4A5B25","#5F742F"],["mint","Mint","#1F5C47","#297A5F"],["lavender","Lavender","#482871","#7742BD"],["cocoa","Cocoa","#6A472F","#906141"],["plum","Plum","#662E6B","#9C46A4"]];
// THEMES END
function applyTheme(){
 const r=document.documentElement;r.setAttribute("data-theme",S.o.theme||"red");r.setAttribute("data-look",S.o.look||"auto");
 document.querySelectorAll("#swatches button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.t===(S.o.theme||"red")));
 document.querySelectorAll("#looks button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.look===(S.o.look||"auto")));
 const m=document.querySelector('meta[name="theme-color"]');if(m)m.content=getComputedStyle(r).getPropertyValue("--hd1").trim()||"#A50034";
}
$("swatches").innerHTML=THEMES.map(([k,n,c1,c2])=>`<button data-t="${k}" title="${n}"><i style="background:linear-gradient(135deg,${c1},${c2})"></i>${n}</button>`).join("");
document.querySelectorAll("#swatches button").forEach(b=>b.onclick=()=>{S.o.theme=b.dataset.t;save();applyTheme()});
document.querySelectorAll("#looks button").forEach(b=>b.onclick=()=>{S.o.look=b.dataset.look;save();applyTheme()});
function themeOpen(on){$("themePop").hidden=!on;$("themeB").setAttribute("aria-expanded",on)}
$("themeB").onclick=e=>{e.stopPropagation();themeOpen($("themePop").hidden)};
document.addEventListener("click",e=>{if(!$("themePop").hidden&&!$("themePop").contains(e.target))themeOpen(false)});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("themePop").hidden){themeOpen(false);$("themeB").focus()}});
applyTheme();

/* ---------- offline support ---------- */
function net(){$("netBadge").hidden=navigator.onLine}
window.addEventListener("online",net);window.addEventListener("offline",net);net();
// When the app is hosted on a website, a service worker saves it so it opens with no internet.
if("serviceWorker" in navigator&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register("sw.js").catch(()=>{});

/* ---------- start ---------- */
// Wait until free.js has loaded too.
document.addEventListener("DOMContentLoaded",route);
