
let bank=window.QUESTION_BANK||[];
let pool=[], index=0, sessionCorrect=0, sessionAnswered=0, mode='mixed';
let state=JSON.parse(localStorage.getItem('meReviewerState')||'{"answered":0,"correct":0,"streak":0}');
let deferredInstall=null;

const $=id=>document.getElementById(id);
$('qtotal').textContent=bank.length;

function shuffle(a){return [...a].sort(()=>Math.random()-0.5)}
function save(){localStorage.setItem('meReviewerState',JSON.stringify(state));updateStats()}
function updateStats(){
  $('answered').textContent=state.answered;
  $('accuracy').textContent=state.answered?Math.round(state.correct/state.answered*100)+'%':'0%';
  $('streak').textContent=state.streak;
}
function show(id){
  ['home','quiz','result'].forEach(x=>$(x).classList.toggle('hidden',x!==id));
  window.scrollTo({top:0,behavior:'smooth'});
}
function start(which){
  mode=which; sessionCorrect=0; sessionAnswered=0; index=0;
  if(which==='mock') pool=shuffle(bank).slice(0,Math.min(20,bank.length));
  else if(which==='mixed') pool=shuffle(bank);
  else pool=shuffle(bank.filter(q=>q.id.startsWith(which)));
  show('quiz'); render();
}
function render(){
  const q=pool[index];
  $('counter').textContent=`Question ${index+1} of ${pool.length}`;
  $('tag').textContent=`${q.function} • ${q.topic}`;
  $('bar').style.width=(index/pool.length*100)+'%';
  $('question').textContent=q.q;
  $('feedback').className='feedback hidden';
  $('feedback').innerHTML='';
  const box=$('options'); box.innerHTML='';
  q.a.forEach((text,i)=>{
    const b=document.createElement('button');
    b.className='option';
    b.innerHTML=`<strong>${String.fromCharCode(65+i)}.</strong> ${escapeHtml(text)}`;
    b.onclick=()=>answer(i,b);
    box.appendChild(b);
  });
}
function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function answer(choice, clicked){
  const q=pool[index];
  if(clicked.disabled)return;
  [...document.querySelectorAll('.option')].forEach((b,i)=>{
    b.disabled=true;
    if(i===q.c)b.classList.add('correct');
  });
  sessionAnswered++; state.answered++;
  if(choice===q.c){
    sessionCorrect++; state.correct++; state.streak++;
    clicked.classList.add('correct');
    $('feedback').innerHTML=`<b>✓ Correct</b><br>${escapeHtml(q.e)}<div class="ref">${escapeHtml(q.ref)}</div>`;
  }else{
    state.streak=0; clicked.classList.add('wrong');
    $('feedback').innerHTML=`<b>Review this item</b><br>Correct answer: <strong>${String.fromCharCode(65+q.c)}. ${escapeHtml(q.a[q.c])}</strong><br>${escapeHtml(q.e)}<div class="ref">${escapeHtml(q.ref)}</div>`;
  }
  $('feedback').className='feedback';
  save();
  setTimeout(()=>{
    index++;
    if(index<pool.length) render(); else finish();
  },650);
}
function finish(){
  $('bar').style.width='100%';
  const pct=Math.round(sessionCorrect/sessionAnswered*100);
  $('resultScore').textContent=pct+'%';
  $('resultText').textContent=`You answered ${sessionCorrect} of ${sessionAnswered} correctly. ${mode==='mock'?'This was a 20-question mock session.':'This was a reviewer session.'}`;
  const topics={};
  pool.forEach(q=>{topics[q.topic]=(topics[q.topic]||{n:0});topics[q.topic].n++});
  $('breakdown').innerHTML=Object.entries(topics).map(([topic,v])=>{
    return `<div class="topicrow"><span>${escapeHtml(topic)}</span><span class="small">${v.n} Q</span></div>`;
  }).join('');
  show('result');
}
function goHome(){show('home');updateStats()}
function resetProgress(){
  if(confirm('Reset all saved progress on this device?')){
    localStorage.removeItem('meReviewerState');
    state={answered:0,correct:0,streak:0}; updateStats();
  }
}

document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>start(b.dataset.mode)));
updateStats();

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}
window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault(); deferredInstall=e; $('installBtn').classList.remove('hidden');
});
$('installBtn').addEventListener('click',async()=>{
  if(!deferredInstall)return;
  deferredInstall.prompt();
  await deferredInstall.userChoice;
  deferredInstall=null;
  $('installBtn').classList.add('hidden');
});
window.addEventListener('appinstalled',()=>{$('installBtn').classList.add('hidden')});
