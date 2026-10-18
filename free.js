/*
  Badger Vocab: start menu and Free Learn
  Copyright (c) 2026 Iman Lloyd. Licensed under the PolyForm Noncommercial License 1.0.0 (see LICENSE.md).
  Required Notice: Copyright (c) 2026 Iman Lloyd. Badger Vocab was made by Iman Lloyd as a gift to the University of Wisconsin-Madison Language Department.

  Free Learn lets people make their own flashcard decks about anything, with optional pictures.
    S.free.decks   [{id, name, voice, made, used}]           saved in localStorage with everything else
    S.free.cards   [{id, deck, f, b, fi, bi}]                 f/b = front/back text, fi/bi = picture ids
    Pictures       IndexedDB database "badgerVocab", store "img"  (localStorage is too small for pictures)
  Practice reuses the language screens: a deck becomes a "language" whose words are its cards.
  Ratings live in S.langs.free.lv under "c:<card id>".
  Routes:  #free        deck list
           #free/<id>   one deck: add and edit cards
           #free/<id>/play   practice
*/

/* ---------- start menu ---------- */
function renderStart(){
 document.title="Badger Vocab";
 const langs=allLangs().filter(l=>count(l.c)).length,decks=FS().decks.length;
 $("scLang").textContent=langs?`${langs} language${langs===1?"":"s"} with words`:"48 languages ready";
 $("scFree").textContent=decks?`${decks} deck${decks===1?"":"s"}`:"No decks yet";
}

/* ---------- storage ---------- */
const FS=()=>S.free||(S.free={decks:[],cards:[]});
const newId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const findDeck=id=>FS().decks.find(d=>d.id===id);
const deckCards=id=>FS().cards.filter(c=>c.deck===id);

// Pictures are stored as small JPEGs in IndexedDB, which can hold far more than localStorage.
const IDB={
 db:null,
 ok:"indexedDB" in window,
 open(){return this.db||(this.db=new Promise((res,rej)=>{const r=indexedDB.open("badgerVocab",1);
  r.onupgradeneeded=()=>r.result.createObjectStore("img");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}))},
 async run(mode,fn){const db=await this.open();return new Promise((res,rej)=>{const tx=db.transaction("img",mode),st=tx.objectStore("img"),q=fn(st);
  tx.oncomplete=()=>res(q&&q.result);tx.onerror=()=>rej(tx.error)})},
 put(id,blob){return this.run("readwrite",s=>s.put(blob,id))},
 get(id){return this.run("readonly",s=>s.get(id))},
 del(id){if(id){delete IMGURL[id];return this.run("readwrite",s=>s.delete(id)).catch(()=>{})}}
};
const IMGURL={};
async function imgURL(id){
 if(!(id in IMGURL)){try{const b=await IDB.get(id);IMGURL[id]=b?URL.createObjectURL(b):""}catch(e){IMGURL[id]=""}}
 return IMGURL[id];
}
// Any <img data-img="..."> added to the page gets its picture filled in automatically.
function hydrate(root){(root||document).querySelectorAll("img[data-img]:not([data-done])").forEach(async im=>{
 im.dataset.done=1;const u=await imgURL(im.dataset.img);if(u)im.src=u;else im.classList.add("missing")})}
new MutationObserver(()=>hydrate()).observe(document.body,{childList:true,subtree:true});

// Shrink a photo to at most 1000px and save it as a JPEG, so each picture is roughly 50–150 KB.
async function shrink(file){
 const url=URL.createObjectURL(file);
 try{
  const im=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=url});
  const sc=Math.min(1,1000/Math.max(im.naturalWidth,im.naturalHeight)),c=document.createElement("canvas");
  c.width=Math.max(1,Math.round(im.naturalWidth*sc));c.height=Math.max(1,Math.round(im.naturalHeight*sc));
  const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);
  return await new Promise(r=>c.toBlob(r,"image/jpeg",.82));
 }finally{URL.revokeObjectURL(url)}
}
const toDataURL=b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(b)});
const fromDataURL=async u=>(await fetch(u)).blob();

/* ---------- open a deck for practice ---------- */
function openDeck(d){
 const v=findLang(d.voice||"");
 cur={c:"free",free:true,deck:d,cat:"*",nb:0,cats:[],
  l:{c:"free",n:d.name,nat:"",tts:v?v.tts:"",dev:v?v.dev:"",rtl:false,arab:!!(v&&v.arab)},
  W:deckCards(d.id).map(c=>[c.f||"","",c.b||"","",c.fi||null,c.bi||null,c.id,c.a||""])};
 document.body.classList.toggle("arab",cur.l.arab);
}

function routeFree(parts){
 const id=parts[1];
 if(!id){show("vFree");renderFreeHome();return}
 const d=findDeck(id);
 if(!d){history.replaceState(null,"","#free");show("vFree");renderFreeHome();return}
 openDeck(d);
 if(parts[2]==="play"&&cur.W.length){d.used=Date.now();save();show("vPlay");startPlay();return}
 if(parts[2]==="play")history.replaceState(null,"","#free/"+d.id);
 show("vDeck");renderDeck();
}

/* ---------- deck list ---------- */
function deckStats(d){
 const lv=LS("free").lv,cs=deckCards(d.id),k=[0,0,0,0];cs.forEach(c=>k[lv["c:"+c.id]||0]++);return {n:cs.length,k};
}
function renderFreeHome(){
 document.title="Free Learn · Badger Vocab";
 const D=FS().decks.slice().sort((a,b)=>(b.used||b.made)-(a.used||a.made));
 if(!D.length){$("decks").innerHTML=`<div class="empty">No decks yet. Tap “+ New deck” to make your first one. A deck can be about anything: biology terms, history dates, famous paintings, or people’s names and faces.</div>`;return}
 $("decks").innerHTML=`<div class="ggrid">${D.map(d=>{const {n,k}=deckStats(d),t=n||1,p=x=>(k[x]/t*100).toFixed(1);
  const cover=deckCards(d.id).find(c=>c.fi||c.bi);
  return `<button class="g deckc" data-id="${esc(d.id)}">${cover?`<span class="cover">${img(cover.fi||cover.bi,"")}</span>`:""}<span class="gt">${esc(d.name)}</span><span class="gc">${n} card${n===1?"":"s"} · ${k[3]} known</span><span class="gb"><i class="k3" style="width:${p(3)}%"></i><i class="k2" style="width:${p(2)}%"></i><i class="k1" style="width:${p(1)}%"></i></span></button>`}).join("")}</div>`;
 document.querySelectorAll(".deckc").forEach(b=>b.onclick=()=>go("free/"+b.dataset.id));
}
$("newDeckB").onclick=()=>{$("newDeckP").hidden=false;$("ndName").focus()};
$("ndCancel").onclick=()=>{$("newDeckP").hidden=true;$("ndName").value=""};
function createDeck(){
 const n=$("ndName").value.trim();if(!n){$("ndName").focus();return}
 const d={id:newId(),name:n,voice:"",made:Date.now()};FS().decks.push(d);save();
 $("ndName").value="";$("newDeckP").hidden=true;go("free/"+d.id);
}
$("ndCreate").onclick=createDeck;$("ndName").onkeydown=e=>{if(e.key==="Enter")createDeck()};

/* ---------- one deck ---------- */
let ed={card:null,fi:null,bi:null,temp:new Set()};
function renderDeck(){
 const d=cur.deck,{n,k}=deckStats(d);
 document.title=d.name+" · Free Learn";
 $("dTitle").textContent=d.name;
 $("dInfo").textContent=n?`${n} card${n===1?"":"s"} · ${k[3]} know · ${k[2]} semi-know · ${k[1]} don’t know · ${k[0]} unrated`:"No cards yet. Add your first card below.";
 $("dPlay").disabled=!n;$("dPracticeBox").hidden=!n;
 const vs=allLangs().filter(l=>l.tts||l.dev).sort((a,b)=>a.n.localeCompare(b.n));
 $("dVoice").innerHTML='<option value="">Off</option>'+vs.map(l=>`<option value="${esc(l.c)}">${esc(l.n)}</option>`).join("");
 $("dVoice").value=d.voice||"";
 syncOpts();renderPick("fi");renderPick("bi");renderCards();
 $("imgNote").hidden=IDB.ok;
}
$("dVoice").onchange=()=>{cur.deck.voice=$("dVoice").value;save();openDeck(cur.deck)};
$("dPlay").onclick=()=>go("free/"+cur.deck.id+"/play");
$("dRename").onclick=()=>{const nn=(prompt("New name for this deck:",cur.deck.name)||"").trim();if(!nn)return;cur.deck.name=nn;save();openDeck(cur.deck);renderDeck()};
$("dDelete").onclick=()=>{
 const d=cur.deck,cs=deckCards(d.id);
 if(!confirm(`Delete the deck “${d.name}” and its ${cs.length} card${cs.length===1?"":"s"}? This can’t be undone.`))return;
 cs.forEach(c=>{IDB.del(c.fi);IDB.del(c.bi);delete LS("free").lv["c:"+c.id]});
 FS().cards=FS().cards.filter(c=>c.deck!==d.id);FS().decks=FS().decks.filter(x=>x.id!==d.id);save();go("free");
};

/* card editor */
function renderPick(side){
 const box=$(side==="fi"?"ceFImg":"ceBImg"),id=ed[side];
 if(!IDB.ok){box.innerHTML="";return}
 box.innerHTML=id?`<img class="pthumb" data-img="${esc(id)}" alt="Picture on this side"><div class="lv"><label class="btn alt sm">Change<input type="file" accept="image/*" hidden></label><button class="btn danger sm">Remove</button></div>`
  :`<label class="btn alt sm addpic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m21 16-5-5-8 8"/></svg>Add picture<input type="file" accept="image/*" hidden></label>`;
 box.querySelector("input").onchange=async e=>{
  const f=e.target.files[0];if(!f)return;$("ceMsg").textContent="Adding picture…";
  try{const b=await shrink(f),nid=newId();await IDB.put(nid,b);
   if(ed[side]&&ed.temp.has(ed[side])){IDB.del(ed[side]);ed.temp.delete(ed[side])}
   ed.temp.add(nid);ed[side]=nid;$("ceMsg").textContent="";renderPick(side);
  }catch(err){$("ceMsg").textContent="That picture couldn’t be added. Try a JPG or PNG file."}
 };
 const rm=box.querySelector("button.danger");
 if(rm)rm.onclick=()=>{if(ed.temp.has(id)){IDB.del(id);ed.temp.delete(id)}ed[side]=null;renderPick(side)};
}
function resetEditor(keepTemp){
 if(!keepTemp)ed.temp.forEach(id=>IDB.del(id));
 ed={card:null,fi:null,bi:null,temp:new Set()};
 $("ceF").value=$("ceB").value=$("ceA").value="";$("ceSave").textContent="Add card";$("ceCancel").hidden=true;$("ceSum").textContent="Add a card";
 renderPick("fi");renderPick("bi");
}
$("ceSave").onclick=()=>{
 const f=$("ceF").value.trim(),b=$("ceB").value.trim(),a=$("ceA").value.trim();
 if(!f&&!ed.fi){$("ceMsg").textContent="Add some text or a picture to the front.";return}
 if(!b&&!ed.bi){$("ceMsg").textContent="Add some text or a picture to the back.";return}
 if(ed.card){
  const c=ed.card;if(c.fi&&c.fi!==ed.fi)IDB.del(c.fi);if(c.bi&&c.bi!==ed.bi)IDB.del(c.bi);
  Object.assign(c,{f,b,a,fi:ed.fi,bi:ed.bi});$("ceMsg").textContent="Card updated.";
 }else{FS().cards.push({id:newId(),deck:cur.deck.id,f,b,a,fi:ed.fi,bi:ed.bi});$("ceMsg").textContent="Card added."}
 save();resetEditor(true);openDeck(cur.deck);renderDeck();$("ceF").focus();
};
$("ceCancel").onclick=()=>{resetEditor();$("ceMsg").textContent=""};
function editCard(c){
 resetEditor();ed.card=c;ed.fi=c.fi||null;ed.bi=c.bi||null;
 $("ceF").value=c.f||"";$("ceB").value=c.b||"";$("ceA").value=c.a||"";$("ceSave").textContent="Save changes";$("ceCancel").hidden=false;$("ceSum").textContent="Edit card";
 renderPick("fi");renderPick("bi");$("cardEd").open=true;$("cardEd").scrollIntoView({behavior:"smooth",block:"start"});$("ceF").focus();
}
function renderCards(){
 const cs=deckCards(cur.deck.id),box=$("cards");box.innerHTML="";
 $("cardsH").textContent=cs.length?`Cards (${cs.length})`:"Cards";
 cs.forEach((c,k)=>{
  const d=document.createElement("div");d.className="w crow";
  d.innerHTML=`<span class="ln">${k+1}</span><div class="cside">${img(c.fi,"lthumb")}<span>${esc(c.f)}</span></div><div class="cside back">${img(c.bi,"lthumb")}<span>${esc(c.b)}</span></div>`;
  const bt=document.createElement("div");bt.className="lv";
  const e=document.createElement("button");e.className="btn alt sm";e.textContent="Edit";e.onclick=()=>editCard(c);
  const x=document.createElement("button");x.className="btn danger sm";x.textContent="Delete";
  x.onclick=()=>{if(!confirm("Delete this card?"))return;IDB.del(c.fi);IDB.del(c.bi);delete LS("free").lv["c:"+c.id];
   FS().cards=FS().cards.filter(y=>y!==c);save();openDeck(cur.deck);renderDeck()};
  bt.append(e,x);d.appendChild(bt);box.appendChild(d);
 });
}
$("ceBulkB").onclick=()=>{
 let n=0;$("ceBulk").value.split("\n").forEach(l=>{const p=l.includes("\t")?l.split("\t"):l.split(":");if(p.length<2)return;
  const f=p[0].trim(),b=p.slice(1).join(l.includes("\t")?" ":":").trim();if(!f||!b)return;
  FS().cards.push({id:newId(),deck:cur.deck.id,f,b,fi:null,bi:null});n++});
 $("ceBulk").value="";save();openDeck(cur.deck);renderDeck();$("ceMsg").textContent=`${n} card${n===1?"":"s"} added.`;
};

/* ---------- sharing decks ---------- */
function download(name,obj){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(obj)],{type:"application/json"}));a.download=name;a.click()}
async function pic(id){if(!id)return null;try{const b=await IDB.get(id);return b?await toDataURL(b):null}catch(e){return null}}
$("dExport").onclick=async()=>{
 const d=cur.deck,cs=deckCards(d.id),out={badgerVocabDeck:1,name:d.name,voice:d.voice||"",cards:[]};
 $("ceMsg").textContent="Preparing the deck file…";
 for(const c of cs)out.cards.push({f:c.f,b:c.b,a:c.a||"",fi:await pic(c.fi),bi:await pic(c.bi)});
 download(d.name.replace(/[^\p{L}\p{N}]+/gu,"-").replace(/^-|-$/g,"")+".badgerdeck.json",out);
 $("ceMsg").textContent="Deck saved as a file. Send it to anyone, and they can add it with “Import a deck” in Free Learn.";
};
$("impDeck").onchange=async e=>{
 const f=e.target.files[0];e.target.value="";if(!f)return;
 try{
  const j=JSON.parse(await f.text());if(!j.badgerVocabDeck||!Array.isArray(j.cards))throw 0;
  let name=String(j.name||"Imported deck"),k=2;while(FS().decks.some(d=>d.name===name))name=`${j.name} (${k++})`;
  const d={id:newId(),name,voice:String(j.voice||""),made:Date.now()};
  for(const c of j.cards){
   const card={id:newId(),deck:d.id,f:String(c.f||""),b:String(c.b||""),a:String(c.a||""),fi:null,bi:null};
   for(const s of ["fi","bi"])if(typeof c[s]==="string"&&c[s].startsWith("data:image/")&&IDB.ok){const id=newId();await IDB.put(id,await fromDataURL(c[s]));card[s]=id}
   if((card.f||card.fi)&&(card.b||card.bi))FS().cards.push(card);
  }
  FS().decks.push(d);save();$("freeMsg").textContent=`Added “${name}”.`;renderFreeHome();
 }catch(err){$("freeMsg").textContent="That file isn’t a Badger Vocab deck."}
};

/* ---------- full backups now include pictures ---------- */
$("exp").onclick=async()=>{
 $("bMsg").textContent="Preparing backup…";
 const images={};for(const c of FS().cards)for(const s of ["fi","bi"])if(c[s])images[c[s]]=await pic(c[s]);
 download("badger-vocab-backup.json",Object.assign({},S,{images}));$("bMsg").textContent="Backup saved.";
};
$("imp").onchange=e=>{const f=e.target.files[0];e.target.value="";if(f)f.text().then(async x=>{try{const j=JSON.parse(x);
 if(j.langs){const imgs=j.images||{};delete j.images;S=Object.assign({langs:{},o:{},custom:[]},j);
  if(IDB.ok)for(const id in imgs)if(imgs[id])await IDB.put(id,await fromDataURL(imgs[id]))}
 else if(j.lv||j.mine){fromOld(j)}else throw 0;
 S.o=Object.assign({},DEF,S.o);S.migrated=1;save();cur=null;$("bMsg").textContent="Backup imported.";applyTheme();route()}catch(err){$("bMsg").textContent="That file couldn’t be read."}})};
