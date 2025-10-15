const tabs = document.querySelectorAll('nav button');
const sections = document.querySelectorAll('.tab');
tabs.forEach(btn=>btn.addEventListener('click',()=>{
  sections.forEach(s=>s.classList.remove('active'));
  document.getElementById(btn.dataset.tab).classList.add('active');
}));

// Helpers
async function api(path, options){
  const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options });
  if(!res.ok) throw new Error(await res.text());
  return res.json();
}
function statusBadge(status){
  const cls = status === 'done' ? 'done' : status === 'in-progress' ? 'in-progress' : 'pending';
  return `<span class="status ${cls}">${status}</span>`;
}

function fmtDate(iso){
  try { return new Date(iso).toLocaleString(); } catch { return iso || ''; }
}

// Transports
const transportForm = document.getElementById('transport-form');
const transportBody = document.querySelector('#transport-table tbody');
async function loadTransports(){
  const list = await api('/api/transports');
  transportBody.innerHTML = list.map(t=>`<tr>
    <td>${t.requestId}</td><td>${t.system}</td><td>${t.owner}</td><td>${fmtDate(t.createdAt)}</td>
    <td>${statusBadge(t.status)}</td>
    <td class="actions">
      <button onclick="updateTransport('${t.id}','in-progress')">Iniciar</button>
      <button onclick="updateTransport('${t.id}','done')">Finalizar</button>
      <button onclick="deleteTransport('${t.id}')">Excluir</button>
    </td>
  </tr>`).join('');
}
transportForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const form = new FormData(transportForm);
  await api('/api/transports', { method: 'POST', body: JSON.stringify(Object.fromEntries(form)) });
  transportForm.reset();
  loadTransports();
});
window.updateTransport = async (id,status)=>{ await api(`/api/transports/${id}`, { method:'PUT', body: JSON.stringify({ status })}); loadTransports(); };
window.deleteTransport = async (id)=>{ await api(`/api/transports/${id}`, { method:'DELETE' }); loadTransports(); };

// Notes
const noteForm = document.getElementById('note-form');
const notesBody = document.querySelector('#notes-table tbody');
async function loadNotes(){
  const list = await api('/api/notes');
  notesBody.innerHTML = list.map(n=>`<tr>
    <td>${n.noteId}</td><td>${n.system}</td><td>${n.owner}</td>
    <td>${statusBadge(n.status)}</td>
    <td class="actions">
      <button onclick="updateNote('${n.id}','in-progress')">Iniciar</button>
      <button onclick="updateNote('${n.id}','done')">Finalizar</button>
      <button onclick="deleteNote('${n.id}')">Excluir</button>
    </td>
  </tr>`).join('');
}
noteForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const form = new FormData(noteForm);
  await api('/api/notes', { method: 'POST', body: JSON.stringify(Object.fromEntries(form)) });
  noteForm.reset();
  loadNotes();
});
window.updateNote = async (id,status)=>{ await api(`/api/notes/${id}`, { method:'PUT', body: JSON.stringify({ status })}); loadNotes(); };
window.deleteNote = async (id)=>{ await api(`/api/notes/${id}`, { method:'DELETE' }); loadNotes(); };

// Upgrades
const upgradeForm = document.getElementById('upgrade-form');
const upgradesBody = document.querySelector('#upgrades-table tbody');
async function loadUpgrades(){
  const list = await api('/api/upgrades');
  upgradesBody.innerHTML = list.map(u=>`<tr>
    <td>${u.name}</td><td>${u.window}</td><td>${u.owner}</td>
    <td>${statusBadge(u.status)}</td>
    <td class="actions">
      <button onclick="updateUpgrade('${u.id}','in-progress')">Iniciar</button>
      <button onclick="updateUpgrade('${u.id}','done')">Finalizar</button>
      <button onclick="deleteUpgrade('${u.id}')">Excluir</button>
    </td>
  </tr>`).join('');
}
upgradeForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const form = new FormData(upgradeForm);
  await api('/api/upgrades', { method: 'POST', body: JSON.stringify(Object.fromEntries(form)) });
  upgradeForm.reset();
  loadUpgrades();
});
window.updateUpgrade = async (id,status)=>{ await api(`/api/upgrades/${id}`, { method:'PUT', body: JSON.stringify({ status })}); loadUpgrades(); };
window.deleteUpgrade = async (id)=>{ await api(`/api/upgrades/${id}`, { method:'DELETE' }); loadUpgrades(); };

// Initial loads
loadTransports();
loadNotes();
loadUpgrades();


