// Data
let cards = JSON.parse(localStorage.getItem('cards')||'[]');
let currentTab = 'all';
let pendingDeleteIndex = null;
let deleteAllMode = false;

// Utils
function save(){ localStorage.setItem('cards', JSON.stringify(cards)); }
function daysRemaining(dateStr){
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000*60*60*24));
}

// Tabs
function setTab(t){ currentTab=t; renderCards(); }

// Search
function query(){ const el = document.getElementById('searchInput'); return el? el.value.trim() : ''; }

// Render
function renderCards(){
  const wrap = document.getElementById('cardsContainer');
  if(!wrap) return;
  wrap.innerHTML='';
  const q = query();
  cards.forEach((c, idx)=>{
    const remaining = daysRemaining(c.exp);
    const expired = remaining <= 0;
    // filter by tab
    let show = true;
    if(currentTab!=='all'){
      if(currentTab==='منتهي') show = expired;
      else show = c.cat === currentTab;
    }
    // search
    if(q && !(c.name.includes(q) || (c.nat||'').includes(q))) show = false;
    if(!show) return;

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <button class="delete-btn" title="حذف" onclick="confirmDelete(${idx})">🗑️</button>
      ${c.img? `<img src="${c.img}" alt="صورة">` : ''}
      <h3>${c.name||''}</h3>
      <div class="meta">رقم وطني: ${c.nat||''}</div>
      <div class="meta">الفئة: ${c.cat||''} • ينتهي: ${c.exp||''}</div>
      <div class="count-badge ${expired? 'count-expired':'count-active'}">
        ${expired? '❌ انتهى — رجاء التجديد' : '⏳ باقي ' + remaining + ' يوم'}
      </div>
    `;
    wrap.appendChild(card);
  });
}

// Add Modal
function openAddModal(){ document.getElementById('addModal').classList.remove('hidden'); }
function closeAddModal(){ document.getElementById('addModal').classList.add('hidden'); resetAddForm(); }
function previewImage(e){
  const file = e.target.files[0];
  const img = document.getElementById('previewImg');
  if(!file){ img.src=''; return; }
  const reader = new FileReader();
  reader.onload = ()=> img.src = reader.result;
  reader.readAsDataURL(file);
}
function resetAddForm(){
  ['nameInput','natIdInput','catInput','expInput','imgInput'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.value = '';
  });
  const img = document.getElementById('previewImg'); if(img) img.src='';
}
function saveCard(){
  const name = document.getElementById('nameInput').value.trim();
  const nat  = document.getElementById('natIdInput').value.trim();
  const cat  = document.getElementById('catInput').value;
  const exp  = document.getElementById('expInput').value;
  const file = document.getElementById('imgInput').files[0];
  if(!name || !nat || !exp){ alert('الرجاء تعبئة الاسم والرقم الوطني وتاريخ الانتهاء'); return; }
  const pushItem = (imgData)=>{
    cards.push({name, nat, cat, exp, img: imgData||''});
    save(); closeAddModal(); renderCards();
  };
  if(file){
    const r = new FileReader();
    r.onload = ()=> pushItem(r.result);
    r.readAsDataURL(file);
  } else {
    pushItem('');
  }
}

// Delete confirmations
function confirmDeleteAll(){
  deleteAllMode = true; pendingDeleteIndex = null;
  document.getElementById('confirmText').innerText = 'هل أنت متأكد أنك تريد حذف جميع التأمين؟';
  document.getElementById('confirmModal').classList.remove('hidden');
  document.getElementById('confirmYes').onclick = ()=>{
    cards = []; save(); closeConfirm(); renderCards();
  };
}
function confirmDelete(index){
  deleteAllMode = false; pendingDeleteIndex = index;
  document.getElementById('confirmText').innerText = 'هل تريد حذف التأمين؟';
  document.getElementById('confirmModal').classList.remove('hidden');
  document.getElementById('confirmYes').onclick = ()=>{
    if(pendingDeleteIndex!=null){ cards.splice(pendingDeleteIndex,1); save(); }
    closeConfirm(); renderCards();
  };
}
function closeConfirm(){ document.getElementById('confirmModal').classList.add('hidden'); }

// Initial render & daily refresh on load
document.addEventListener('DOMContentLoaded', ()=>{
  renderCards();
});
