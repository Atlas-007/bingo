const BOARD_SIZE = 25;
const boardEl = document.getElementById('board');
const modal = document.getElementById('modal');
const goalText = document.getElementById('goalText');
const goalImage = document.getElementById('goalImage');
const jsonArea = document.getElementById('jsonArea');


let state = loadState();
let editingIndex = null;


function defaultState(){ return Array.from({length:BOARD_SIZE},(_,i)=>({text:`Goal ${i+1}`, image:'', done:false})); }
function saveState(){ localStorage.setItem('bingo-state', JSON.stringify(state)); }
function loadState(){
try{
if(location.hash && location.hash.startsWith('#state=')){
const encoded = location.hash.replace('#state=','');
const json = atob(decodeURIComponent(encoded));
return JSON.parse(json);
}
}catch(e){console.warn('failed to parse hash state', e)}
try{ const s = localStorage.getItem('bingo-state'); return s? JSON.parse(s): defaultState(); }
catch(e){return defaultState();}
}


function render(){
boardEl.innerHTML='';
state.forEach((cell,i)=>{
const el = document.createElement('button');
el.className = 'cell' + (cell.done? ' done':'');
el.setAttribute('data-index', i);
el.setAttribute('aria-label', cell.text || `Cell ${i+1}`);
el.innerHTML = `
<div class="check"><input type="checkbox" ${cell.done? 'checked':''}></div>
<div class="emoji">${cell.image || ''}</div>
<div class="text">${escapeHtml(cell.text || '')}</div>
`;
el.addEventListener('click',(e)=>{ if(e.target.tagName==='INPUT'){ toggleDone(i); e.stopPropagation(); return; } openEditor(i); });
boardEl.appendChild(el);
});
}


function toggleDone(i){ state[i].done = !state[i].done; saveState(); render(); }
function openEditor(i){ editingIndex=i; document.getElementById('modalTitle').textContent=`Edit cell ${i+1}`; goalText.value=state[i].text||''; goalImage.value=state[i].image||''; modal.style.display='flex'; modal.setAttribute('aria-hidden','false'); goalText.focus();}
function closeEditor(){ editingIndex=null; modal.style.display='none'; modal.setAttribute('aria-hidden','true'); }
function saveCell(){ if(editingIndex===null) return; state[editingIndex].text=goalText.value.trim(); state[editingIndex].image=goalImage.value.trim(); saveState(); render(); closeEditor();}
function clearCell(){ if(editingIndex===null) return; state[editingIndex]={text:'', image:'', done:false}; saveState(); render(); closeEditor();}
function newBoard(){ state = defaultState(); saveState(); render(); }
function resetBoard(){ if(confirm('Reset board to empty default?')){ state = Array.from({length:BOARD_SIZE}).map(()=>({text:'',image:'',done:false})); saveState(); render(); } }


function randomizeFromList(lines){ const items = lines.map(l=>l.trim()).filter(Boolean); if(!items.length) return alert('No items in the list'); const shuffled = shuffle(items); for(let i=0;i<BOARD_SIZE;i++){ state[i].text=shuffled[i%shuffled.length]; state[i].image=''; state[i].done=false; } saveState(); render();}
function shuffle(arr){ const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }


function exportJSON(){ const json=JSON.stringify(state,null,2); jsonArea.value=json; jsonArea.select(); document.execCommand('copy'); const blob=new Blob([json],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='bingo-board.json'; document.body.appendChild(a); a.click(); a.remove();}
function importJSON(){ const raw=prompt('Paste board JSON here'); if(!raw) return; try{ const parsed=JSON.parse(raw); if(Array.isArray(parsed)&&parsed.length===BOARD_SIZE){ state=parsed; saveState(); render(); alert('Imported');} else alert('Invalid board JSON');}catch(e){alert('Failed to parse JSON: '+e.message);}}
function shareURL(){ const json=JSON.stringify(state); const encoded=encodeURIComponent(btoa(json)); const url=location.origin+location.pathname+'#state='+encoded; prompt('Shareable URL (copy):',url);}
function escapeHtml(s){ return (s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]);}


// Event listeners
$('#saveCell')?.addEventListener('click', saveCell);
$('#cancel')?.addEventListener('click', closeEditor);
$('#clearCell')?.addEventListener('click', clearCell);
$('#newBoard')?.addEventListener('click', ()=>{ if(confirm('Create new 5×5 board?')) newBoard(); });
$('#reset')?.addEventListener('click', resetBoard);
$('#randomize')?.addEventListener('click', ()=>{ const lines=prompt('Paste items (one per line)'); if(lines) randomizeFromList(lines.split('\n')); });
$('#export')?.addEventListener('click', exportJSON);
$('#import')?.addEventListener('click', importJSON);
$('#share')?.addEventListener('click', shareURL);
$('#applyQuick')?.addEventListener('click',()=>{ const txt=$('#quickList').value.split('\n').map(l=>l.trim()).filter(Boolean); if(!txt.length) return alert('No lines'); let idx=0; for(let i=0;i<BOARD_SIZE&&idx<txt.length;i++){ if(!state[i].text){ state[i].text=txt[idx++]; } } saveState(); render();});
$('#randomFill')?.addEventListener('click',()=>{ const txt=$('#quickList').value.split('\n').map(l=>l.trim()).filter(Boolean); if(!txt.length) return alert('No lines'); randomizeFromList(txt);});
modal.addEventListener('click', (e)=>{ if(e.target===modal) closeEditor(); });
window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeEditor(); });


render();
function $(sel){ return document.querySelector(sel); }