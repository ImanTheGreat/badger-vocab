/*
  Badger Vocab: Study Break (Sudoku and chess puzzles)
  Copyright (c) 2026 Iman Lloyd. Licensed under the PolyForm Noncommercial License 1.0.0 (see LICENSE.md).
  Required Notice: Copyright (c) 2026 Iman Lloyd. Badger Vocab was made by Iman Lloyd as a gift to the University of Wisconsin-Madison Language Department.

  Routes:  #break         menu
           #break/sudoku  Sudoku: fresh puzzles with exactly one solution, pen and pencil, scoring
           #break/chess   Chess puzzles from the Lichess open database (chess-puzzles.js), Elo rating
  Saved in S.brk (localStorage) with everything else.
*/
const BRK=()=>S.brk||(S.brk={});

function routeBreak(parts){
 const g=parts[1];document.body.classList.remove("arab");
 if(g==="sudoku"){document.title="Sudoku · Badger Vocab";show("vSudoku");sdOpen();return}
 if(g==="chess"){document.title="Chess Puzzles · Badger Vocab";show("vChess");czOpen();return}
 if(g)history.replaceState(null,"","#break");
 document.title="Study Break · Badger Vocab";show("vBreak");
 const sd=BRK().sd,cz=BRK().cz;
 $("sbSud").textContent=sd&&sd.puz&&!sd.done?`Puzzle in progress (${SD[sd.lv].n})`:"Easy to extra hard";
 $("sbChess").textContent=typeof CHESS==="undefined"?"Puzzles not included in this copy":cz?`Your rating: ${Math.round(cz.rating)}`:`${CHESS.length} puzzles`;
}

/* ======================= SUDOKU ======================= */
// min/max = how many numbers are given; pts per correct number; bonus for finishing.
// "singles": must be solvable with the basic techniques; "tough": must need more than that.
const SD={easy:{n:"Easy",min:36,max:40,pts:10,bonus:100,singles:true},
 medium:{n:"Medium",min:30,max:34,pts:15,bonus:200,singles:true},
 hard:{n:"Hard",min:26,max:29,pts:20,bonus:300},
 xhard:{n:"Extra hard",min:22,max:25,pts:30,bonus:500,tough:true}};
const UNITS=[],PEERS=[];
for(let k=0;k<9;k++){UNITS.push([...Array(9)].map((_,j)=>k*9+j));UNITS.push([...Array(9)].map((_,j)=>j*9+k));
 UNITS.push([...Array(9)].map((_,j)=>(Math.floor(k/3)*3+Math.floor(j/3))*9+(k%3)*3+j%3))}
for(let i=0;i<81;i++)PEERS.push([...new Set(UNITS.filter(u=>u.includes(i)).flat())].filter(x=>x!==i));
const box=i=>Math.floor(Math.floor(i/9)/3)*3+Math.floor((i%9)/3);
const bits=m=>{let c=0;while(m){m&=m-1;c++}return c};

// Backtracking search with bitmasks. Counts solutions up to `limit`; with fill=true, returns a random full grid.
function sdSearch(g0,limit,fill){
 const g=g0.slice(),R=Array(9).fill(0),C=Array(9).fill(0),B=Array(9).fill(0);
 for(let i=0;i<81;i++)if(g[i]){const m=1<<g[i],r=Math.floor(i/9),c=i%9,b=box(i);if((R[r]|C[c]|B[b])&m)return fill?null:0;R[r]|=m;C[c]|=m;B[b]|=m}
 let count=0,result=null;
 const rec=()=>{
  let best=-1,bm=0,bc=10;
  for(let i=0;i<81;i++)if(!g[i]){const m=~(R[Math.floor(i/9)]|C[i%9]|B[box(i)])&0x3FE,k=bits(m);if(k<bc){bc=k;best=i;bm=m;if(k<2)break}}
  if(best<0){count++;if(fill)result=g.slice();return fill||count>=limit}
  if(!bc)return false;
  let ds=[1,2,3,4,5,6,7,8,9];if(fill)ds=shuffle(ds);
  const r=Math.floor(best/9),c=best%9,b=box(best);
  for(const d of ds)if(bm&(1<<d)){const m=1<<d;g[best]=d;R[r]|=m;C[c]|=m;B[b]|=m;
   if(rec())return true;g[best]=0;R[r]&=~m;C[c]&=~m;B[b]&=~m}
  return false;
 };
 rec();return fill?result:count;
}
// Can it be solved with only naked and hidden singles (the basic techniques)?
function sdSingles(g0){
 const g=g0.slice(),cand=i=>{let m=0x3FE;for(const p of PEERS[i])if(g[p])m&=~(1<<g[p]);return m};
 for(let prog=true;prog;){prog=false;
  for(let i=0;i<81;i++)if(!g[i]){const m=cand(i);if(!m)return false;if(bits(m)===1){g[i]=Math.log2(m);prog=true}}
  if(prog)continue;
  for(const u of UNITS)for(let d=1;d<=9;d++){if(u.some(i=>g[i]===d))continue;
   const spots=u.filter(i=>!g[i]&&cand(i)&(1<<d));if(spots.length===1){g[spots[0]]=d;prog=true}}
 }
 return g.every(Boolean);
}
function sdGenerate(lv){
 const L=SD[lv],t0=performance.now();let best=null,bestScore=1e9;
 for(let tries=0;tries<400;tries++){
  const sol=sdSearch(Array(81).fill(0),1,true),g=sol.slice(),target=L.min+Math.floor(Math.random()*(L.max-L.min+1));
  let givens=81;
  for(const i of shuffle([...Array(41).keys()])){       // remove cells in mirror-image pairs, keeping one solution
   if(givens<=target)break;const j=80-i,a=g[i],b=g[j];g[i]=g[j]=0;
   if(sdSearch(g,2)===1)givens-=i===j?1:2;else{g[i]=a;g[j]=b}
  }
  const singles=sdSingles(g),ok=givens<=L.max&&(!L.singles||singles)&&(!L.tough||!singles);
  if(ok)return {puz:g,sol};
  const score=Math.abs(givens-target)+(L.tough&&singles?5:0)+(L.singles&&!singles?20:0);
  if(score<bestScore){bestScore=score;best={puz:g.slice(),sol}}
  if(performance.now()-t0>2500)break;
 }
 return best;
}

let sdSel=-1,sdMode="pen",sdTimer=null,sdFlash=null;
const sdState=()=>BRK().sd;
function sdOpen(){
 const s=sdState();$("sdDiff").value=(s&&s.lv)||BRK().sdLv||"easy";
 if(!s||!s.puz)sdNew();else sdRender();
 clearInterval(sdTimer);sdTimer=setInterval(sdTick,1000);
}
function sdNew(){
 const lv=$("sdDiff").value;BRK().sdLv=lv;$("sdMsg").textContent="Making a new puzzle…";$("sdGrid").classList.add("busy");
 setTimeout(()=>{const p=sdGenerate(lv);
  BRK().sd={lv,puz:p.puz,sol:p.sol,val:p.puz.slice(),marks:Array(81).fill(0),score:0,mist:0,sec:0,done:false};
  sdSel=p.puz.indexOf(0);save();$("sdGrid").classList.remove("busy");
  $("sdMsg").textContent=`New ${SD[lv].n.toLowerCase()} puzzle: ${p.puz.filter(Boolean).length} numbers given.`;sdRender()},30);
}
function sdTick(){const s=sdState();if($("vSudoku").hidden||!s||s.done||document.hidden)return;s.sec++;$("sdTime").textContent=fmtTime(s.sec);if(s.sec%10===0)save()}
const fmtTime=t=>`${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`;
function sdRender(){
 const s=sdState();if(!s)return;
 const selV=sdSel>=0?s.val[sdSel]:0,grid=$("sdGrid");
 grid.innerHTML=s.val.map((v,i)=>{
  const cls=["sdc"];if(s.puz[i])cls.push("given");else if(v)cls.push("mine");
  if(i===sdSel)cls.push("sel");else if(sdSel>=0&&PEERS[sdSel].includes(i))cls.push("peer");
  if(selV&&v===selV&&i!==sdSel)cls.push("same");
  if(i%9===2||i%9===5)cls.push("br");if(Math.floor(i/9)===2||Math.floor(i/9)===5)cls.push("bb");
  if(sdFlash&&sdFlash.i===i)cls.push(sdFlash.ok?"ok":"bad");
  const inner=v?v:sdFlash&&sdFlash.i===i&&!sdFlash.ok?sdFlash.d:s.marks[i]?`<span class="mk">${[1,2,3,4,5,6,7,8,9].map(d=>`<i>${s.marks[i]&(1<<d)?d:""}</i>`).join("")}</span>`:"";
  return `<button class="${cls.join(" ")}" data-i="${i}" aria-label="Row ${Math.floor(i/9)+1}, column ${i%9+1}${v?", "+v:""}">${inner}</button>`}).join("");
 grid.querySelectorAll(".sdc").forEach(b=>b.onclick=()=>{sdSel=+b.dataset.i;sdRender()});
 const left=d=>9-s.val.filter(v=>v===d).length;
 $("sdPad").innerHTML=[1,2,3,4,5,6,7,8,9].map(d=>`<button data-d="${d}"${left(d)?"":" disabled"}>${d}<small>${left(d)||""}</small></button>`).join("")+'<button data-d="0" class="erase">Erase</button>';
 $("sdPad").querySelectorAll("button").forEach(b=>b.onclick=()=>sdEnter(+b.dataset.d));
 document.querySelectorAll("#sdTog button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.sd===sdMode));
 $("sdScore").textContent=s.score;$("sdMist").textContent=s.mist;$("sdTime").textContent=fmtTime(s.sec);
 const best=(BRK().sdBest||{})[s.lv];$("sdBest").textContent=best?`Best ${SD[s.lv].n.toLowerCase()} score: ${best}`:"";
 grid.classList.toggle("finished",s.done);
}
function sdEnter(d){
 const s=sdState();if(!s||s.done||sdSel<0||s.puz[sdSel]||s.val[sdSel])return;
 const i=sdSel;
 if(d===0){s.marks[i]=0;save();sdRender();return}
 if(sdMode==="pencil"){s.marks[i]^=1<<d;save();sdRender();return}
 const L=SD[s.lv];
 if(d===s.sol[i]){
  s.val[i]=d;s.marks[i]=0;for(const p of PEERS[i])s.marks[p]&=~(1<<d);s.score+=L.pts;
  sdFlash={i,ok:true};$("sdMsg").textContent=`✓ Correct! +${L.pts}`;
  if(s.val.every((v,k)=>v===s.sol[k])){s.done=true;s.score+=L.bonus;const b=BRK().sdBest||(BRK().sdBest={});const nb=!b[s.lv]||s.score>b[s.lv];if(nb)b[s.lv]=s.score;
   $("sdMsg").textContent=`🎉 Solved in ${fmtTime(s.sec)} with ${s.mist} mistake${s.mist===1?"":"s"}! Finishing bonus +${L.bonus}. Final score: ${s.score}${nb?" (new best!)":""}`}
 }else{
  s.mist++;s.score=Math.max(0,s.score-5);sdFlash={i,ok:false,d};$("sdMsg").textContent=`✗ ${d} isn’t right there. −5`;
 }
 save();sdRender();const f=sdFlash;setTimeout(()=>{if(sdFlash===f){sdFlash=null;sdRender()}},700);
}
$("sdNew").onclick=()=>{const s=sdState();if(s&&s.puz&&!s.done&&s.val.some((v,i)=>v&&!s.puz[i])&&!confirm("Start a new puzzle? This one isn’t finished."))return;sdNew()};
$("sdDiff").onchange=()=>{BRK().sdLv=$("sdDiff").value;save()};
document.querySelectorAll("#sdTog button").forEach(b=>b.onclick=()=>{sdMode=b.dataset.sd;sdRender()});
document.addEventListener("keydown",e=>{
 if($("vSudoku").hidden||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
 if(/^[1-9]$/.test(e.key)){sdEnter(+e.key);e.preventDefault()}
 else if(e.key==="Backspace"||e.key==="Delete"||e.key==="0"){sdEnter(0);e.preventDefault()}
 else if(e.key==="p"||e.key==="P"||e.key==="n"||e.key==="N"){sdMode=sdMode==="pen"?"pencil":"pen";sdRender()}
 else if(e.key.startsWith("Arrow")){if(sdSel<0)sdSel=0;const r=Math.floor(sdSel/9),c=sdSel%9;
  const [nr,nc]={ArrowUp:[r+8,c],ArrowDown:[r+1,c],ArrowLeft:[r,c+8],ArrowRight:[r,c+1]}[e.key];sdSel=(nr%9)*9+nc%9;sdRender();e.preventDefault()}
});

/* ======================= CHESS ======================= */
// Board: 64 squares, index 0 = a8 … 63 = h1 (the same order as a FEN string). White pieces uppercase.
const FILES="abcdefgh";
const sqName=s=>FILES[s&7]+(8-(s>>3)),sqIdx=n=>(8-+n[1])*8+FILES.indexOf(n[0]);
const colorOf=p=>p?(p===p.toUpperCase()?"w":"b"):null;
const KN=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]],KG=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]],
 DI=[[-1,-1],[-1,1],[1,-1],[1,1]],OR=[[-1,0],[1,0],[0,-1],[0,1]];
function parseFEN(f){const [pl,t,c,e]=f.split(" "),b=[];
 for(const ch of pl.replace(/\//g,""))if(/\d/.test(ch))for(let k=0;k<+ch;k++)b.push(null);else b.push(ch);
 return {b,turn:t,castle:c==="-"?"":c,ep:e==="-"?-1:sqIdx(e)}}
function attacked(b,s,by){
 const r=s>>3,f=s&7,at=(rr,ff)=>rr>=0&&rr<8&&ff>=0&&ff<8?b[rr*8+ff]:null,w=by==="w";
 const pr=w?r+1:r-1,P=w?"P":"p";if(at(pr,f-1)===P||at(pr,f+1)===P)return true;
 for(const[dr,df]of KN)if(at(r+dr,f+df)===(w?"N":"n"))return true;
 for(const[dr,df]of KG)if(at(r+dr,f+df)===(w?"K":"k"))return true;
 const slide=(dirs,kinds)=>dirs.some(([dr,df])=>{let rr=r+dr,ff=f+df;
  while(rr>=0&&rr<8&&ff>=0&&ff<8){const p=b[rr*8+ff];if(p)return colorOf(p)===by&&kinds.includes(p.toLowerCase());rr+=dr;ff+=df}return false});
 return slide(DI,"bq")||slide(OR,"rq");
}
function pseudo(st){
 const {b,turn}=st,ms=[],opp=turn==="w"?"b":"w";
 for(let s=0;s<64;s++){const p=b[s];if(!p||colorOf(p)!==turn)continue;
  const r=s>>3,f=s&7,t=p.toLowerCase(),add=(to,promo)=>ms.push({from:s,to,promo}),enemy=q=>q&&colorOf(q)===opp;
  if(t==="p"){const d=turn==="w"?-1:1,start=turn==="w"?6:1,last=turn==="w"?0:7,r1=r+d;
   const push=to=>{if((to>>3)===last)for(const q of "qrbn")add(to,q);else add(to)};
   if(r1>=0&&r1<8&&!b[r1*8+f]){push(r1*8+f);if(r===start&&!b[(r+2*d)*8+f])add((r+2*d)*8+f)}
   for(const df of[-1,1]){const ff=f+df;if(ff<0||ff>7||r1<0||r1>7)continue;const to=r1*8+ff;if(enemy(b[to]))push(to);else if(to===st.ep)add(to)}
  }else if(t==="n"||t==="k"){
   for(const[dr,df]of t==="n"?KN:KG){const rr=r+dr,ff=f+df;if(rr<0||rr>7||ff<0||ff>7)continue;const to=rr*8+ff;if(!b[to]||enemy(b[to]))add(to)}
   if(t==="k"&&s===(turn==="w"?60:4)&&!attacked(b,s,opp)){const R=turn==="w"?"R":"r",C=st.castle;
    if(C.includes(turn==="w"?"K":"k")&&!b[s+1]&&!b[s+2]&&b[s+3]===R&&!attacked(b,s+1,opp)&&!attacked(b,s+2,opp))add(s+2);
    if(C.includes(turn==="w"?"Q":"q")&&!b[s-1]&&!b[s-2]&&!b[s-3]&&b[s-4]===R&&!attacked(b,s-1,opp)&&!attacked(b,s-2,opp))add(s-2)}
  }else for(const[dr,df]of t==="b"?DI:t==="r"?OR:DI.concat(OR)){let rr=r+dr,ff=f+df;
   while(rr>=0&&rr<8&&ff>=0&&ff<8){const to=rr*8+ff;if(!b[to])add(to);else{if(enemy(b[to]))add(to);break}rr+=dr;ff+=df}}
 }
 return ms;
}
function makeMove(st,m){
 const b=st.b.slice(),p=b[m.from],t=p.toLowerCase(),w=st.turn==="w";let ep=-1,c=st.castle;
 if(t==="p"&&m.to===st.ep&&!b[m.to])b[m.to+(w?8:-8)]=null;                 // en passant
 if(t==="p"&&Math.abs(m.to-m.from)===16)ep=(m.from+m.to)/2;
 if(t==="k"&&Math.abs(m.to-m.from)===2){if(m.to>m.from){b[m.from+1]=b[m.from+3];b[m.from+3]=null}else{b[m.from-1]=b[m.from-4];b[m.from-4]=null}}
 b[m.to]=m.promo?(w?m.promo.toUpperCase():m.promo):p;b[m.from]=null;
 if(t==="k")c=c.replace(w?/[KQ]/g:/[kq]/g,"");
 for(const s of[m.from,m.to]){const k={63:"K",56:"Q",7:"k",0:"q"}[s];if(k)c=c.replace(k,"")}
 return {b,turn:w?"b":"w",castle:c,ep};
}
const kingSq=(b,c)=>b.indexOf(c==="w"?"K":"k");
const inCheck=st=>attacked(st.b,kingSq(st.b,st.turn),st.turn==="w"?"b":"w");
const legalMoves=st=>pseudo(st).filter(m=>{const n=makeMove(st,m);return !attacked(n.b,kingSq(n.b,st.turn),n.turn)});
const uci=m=>sqName(m.from)+sqName(m.to)+(m.promo||"");
const fromUci=u=>({from:sqIdx(u.slice(0,2)),to:sqIdx(u.slice(2,4)),promo:u[4]||undefined});

const LEVELS={auto:["Match my rating",0,0],beg:["Beginner (under 1000)",0,999],int:["Intermediate (1000–1399)",1000,1399],
 adv:["Advanced (1400–1799)",1400,1799],exp:["Expert (1800–2199)",1800,2199],mas:["Master (2200+)",2200,4000]};
const GLYPH={k:"♚",q:"♛",r:"♜",b:"♝",n:"♞",p:"♟"};
let CZ=null;
const czData=()=>BRK().cz||(BRK().cz={rating:1200,games:0,solved:0,streak:0,level:"auto",seen:[]});
function czOpen(){
 if(typeof CHESS==="undefined"){$("czPrompt").textContent="Chess puzzles aren’t included in this copy of the app.";return}
 $("czLevel").innerHTML=Object.entries(LEVELS).map(([k,v])=>`<option value="${k}">${v[0]}</option>`).join("");
 $("czLevel").value=czData().level;czStats();if(!CZ)czNew();else czRender();
}
function czStats(){const d=czData();$("czRating").textContent=Math.round(d.rating);$("czSolved").textContent=d.solved;$("czStreak").textContent=d.streak}
function czPick(){
 const d=czData(),lv=d.level;let pool;
 if(lv==="auto"){for(let w=150;w<=1500&&!(pool&&pool.length>=5);w+=150)pool=CHESS.filter(p=>Math.abs(p[3]-d.rating)<=w)}
 else{const [,lo,hi]=LEVELS[lv];pool=CHESS.filter(p=>p[3]>=lo&&p[3]<=hi)}
 const seen=new Set(d.seen),fresh=pool.filter(p=>!seen.has(p[0]));
 const p=(fresh.length?fresh:pool)[Math.floor(Math.random()*(fresh.length?fresh:pool).length)];
 d.seen.push(p[0]);if(d.seen.length>800)d.seen=d.seen.slice(-800);return p;
}
function czNew(){
 const p=czPick(),st=parseFEN(p[1]);
 CZ={p,moves:p[2].split(" "),i:0,st,start:st,player:st.turn==="w"?"b":"w",sel:-1,last:null,failed:false,hint:0,done:false,rated:false,promo:null};
 save();$("czNext").hidden=true;$("czHint").disabled=$("czSol").disabled=false;$("czDelta").textContent="";$("czInfo").textContent="";
 $("czMsg").textContent="";czRender();
 setTimeout(()=>{czPlay(CZ.moves[0]);CZ.i=1;czPrompt();czRender()},650);
}
function czPrompt(){
 const who=CZ.player==="w"?"White":"Black",m=CZ.p[4];
 $("czPrompt").innerHTML=`<i class="tm ${CZ.player}"></i>${who} to move. ${m?`Find checkmate in ${m}.`:"Find the best move."}`;
}
function czPlay(u){const m=fromUci(u);CZ.st=makeMove(CZ.st,m);CZ.last=m}
function czRate(score){                       // Elo update, once per puzzle
 if(CZ.rated)return;CZ.rated=true;const d=czData(),pr=CZ.p[3],E=1/(1+Math.pow(10,(pr-d.rating)/400)),K=d.games<20?40:24;
 const delta=K*(score-E);d.rating=Math.max(400,d.rating+delta);d.games++;
 if(score){d.solved++;d.streak++}else d.streak=0;save();czStats();
 $("czDelta").textContent=`${delta>=0?"+":"−"}${Math.abs(Math.round(delta))}`;$("czDelta").className=delta>=0?"up":"down";
}
function czFinish(){
 CZ.done=true;CZ.sel=-1;
 if(!CZ.failed&&!CZ.hint){czRate(1);$("czMsg").textContent="✓ Solved! Nice work."}
 else $("czMsg").textContent=CZ.failed?"Puzzle complete.":"✓ Solved (with a hint, so your rating didn’t change).";
 $("czNext").hidden=false;$("czHint").disabled=$("czSol").disabled=true;
 $("czInfo").innerHTML=`Puzzle rating: <b>${CZ.p[3]}</b> · <a href="https://lichess.org/training/${encodeURIComponent(CZ.p[0])}" target="_blank" rel="noopener">View on Lichess</a>`;
 czRender();$("czNext").focus();
}
function czUser(m){
 const exp=CZ.moves[CZ.i],u=uci(m),after=makeMove(CZ.st,m);
 const mates=!legalMoves(after).length&&inCheck(after);
 if(u===exp||mates){                       // any checkmate counts, like on Lichess
  CZ.st=after;CZ.last=m;CZ.i++;CZ.sel=-1;
  if(mates||CZ.i>=CZ.moves.length){czFinish();return}
  $("czMsg").textContent="✓ Good move! Keep going.";czRender();
  setTimeout(()=>{czPlay(CZ.moves[CZ.i]);CZ.i++;czRender()},450);
 }else{
  if(!CZ.failed){CZ.failed=true;czRate(0)}
  CZ.sel=-1;$("czMsg").textContent="✗ That’s not the best move. Try again, or tap “Show solution.”";
  const keep=CZ.st;CZ.st=after;CZ.last=m;czRender(true);
  setTimeout(()=>{CZ.st=keep;CZ.last=CZ.i>0?fromUci(CZ.moves[CZ.i-1]):null;czRender()},700);
 }
}
function czRender(wrong){
 if(!CZ)return;const st=CZ.st,flip=CZ.player==="b",targets=CZ.sel>=0?legalMoves(st).filter(m=>m.from===CZ.sel).map(m=>m.to):[];
 const ck=inCheck(st)?kingSq(st.b,st.turn):-1,hintSq=CZ.hint&&!CZ.done&&CZ.moves[CZ.i]?fromUci(CZ.moves[CZ.i]):null;
 let h="";
 for(let k=0;k<64;k++){const s=flip?63-k:k,p=st.b[s],r=s>>3,f=s&7,dark=(r+f)%2===1;
  const cls=["sq",dark?"dk":"lt"];if(CZ.last&&(s===CZ.last.from||s===CZ.last.to))cls.push(wrong?"wrong":"last");
  if(s===CZ.sel)cls.push("sel");if(s===ck)cls.push("check");
  if(hintSq&&(s===hintSq.from||(CZ.hint>1&&s===hintSq.to)))cls.push("hint");
  const lab=(k%8===0?`<span class="rk">${8-r}</span>`:"")+(k>=56?`<span class="fl">${FILES[f]}</span>`:"");
  h+=`<button class="${cls.join(" ")}" data-s="${s}" aria-label="${sqName(s)}${p?" "+(colorOf(p)==="w"?"white ":"black ")+{k:"king",q:"queen",r:"rook",b:"bishop",n:"knight",p:"pawn"}[p.toLowerCase()]:""}">${lab}${p?`<span class="pc ${colorOf(p)}">${GLYPH[p.toLowerCase()]}</span>`:""}${targets.includes(s)?`<span class="${p?"cap":"dot"}"></span>`:""}</button>`;
 }
 $("czBoard").innerHTML=h;
 $("czBoard").querySelectorAll(".sq").forEach(b=>b.onclick=()=>czTap(+b.dataset.s));
}
function czTap(s){
 if(!CZ||CZ.done||CZ.i===0||CZ.st.turn!==CZ.player)return;
 const p=CZ.st.b[s];
 if(CZ.sel>=0){
  const ms=legalMoves(CZ.st).filter(m=>m.from===CZ.sel&&m.to===s);
  if(ms.length){if(ms.length>1){czAskPromo(ms);return}czUser(ms[0]);return}
 }
 CZ.sel=p&&colorOf(p)===CZ.player&&s!==CZ.sel?s:-1;czRender();
}
function czAskPromo(ms){
 const box=$("czPromo"),w=CZ.player==="w";box.hidden=false;
 box.innerHTML="Promote to: "+["q","r","b","n"].map(q=>`<button data-q="${q}" class="pcb"><span class="pc ${w?"w":"b"}">${GLYPH[q]}</span></button>`).join("");
 box.querySelectorAll("button").forEach(b=>b.onclick=()=>{box.hidden=true;czUser(ms.find(m=>m.promo===b.dataset.q))});
}
$("czNew").onclick=()=>{if(CZ&&!CZ.done&&CZ.i>1&&!CZ.rated){CZ.failed=true;czRate(0)}czNew()};
$("czNext").onclick=czNew;
$("czLevel").onchange=()=>{czData().level=$("czLevel").value;save();czNew()};
$("czHint").onclick=()=>{if(!CZ||CZ.done||CZ.i===0)return;CZ.hint=Math.min(2,CZ.hint+1);
 $("czMsg").textContent=CZ.hint===1?"Hint: the highlighted piece is the one to move.":"Hint: move it to the other highlighted square.";czRender()};
$("czSol").onclick=()=>{
 if(!CZ||CZ.done||CZ.i===0)return;if(!CZ.failed){CZ.failed=true;czRate(0)}
 $("czHint").disabled=$("czSol").disabled=true;CZ.sel=-1;
 const step=()=>{if(CZ.i>=CZ.moves.length){czFinish();return}czPlay(CZ.moves[CZ.i]);CZ.i++;czRender();setTimeout(step,700)};step();
};
