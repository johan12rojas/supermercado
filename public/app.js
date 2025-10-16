// Auth simple
const auth = {
  key: 'super_auth_v1',
  login(email, password) {
    if (email === 'admin@gmail.com' && password === 'admin1234') {
      localStorage.setItem(this.key, 'admin');
      return true;
    }
    return false;
  },
  logout() { localStorage.removeItem(this.key); },
  isAdmin() { return localStorage.getItem(this.key) === 'admin'; },
  checkAdmin() {
    if (!this.isAdmin()) {
      alert('Acceso restringido. Solo administradores.');
      window.location.href = '/';
      return false;
    }
    return true;
  }
};

const api = {
  async listProducts(params={}){
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`/api/products${qs?`?${qs}`:''}`);
    return await res.json();
  },
  async getProduct(id){
    const res = await fetch(`/api/products/${id}`);
    return await res.json();
  },
  async createProduct(data){
    const res = await fetch('/api/products',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    if(!res.ok) throw new Error('Error creando producto');
    return await res.json();
  },
  async updateProduct(id,data){
    const res = await fetch(`/api/products/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    if(!res.ok) throw new Error('Error actualizando producto');
    return await res.json();
  },
  async deleteProduct(id){
    const res = await fetch(`/api/products/${id}`,{method:'DELETE'});
    if(!res.ok) throw new Error('Error eliminando producto');
  },
  async createOrder(items){
    const res = await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items})});
    return await res.json();
  }
};

// Carrito simple en localStorage
const cartKey = 'super_cart_v1';
const cart = {
  get(){
    try{ return JSON.parse(localStorage.getItem(cartKey)||'[]'); }catch{ return []; }
  },
  set(items){ localStorage.setItem(cartKey, JSON.stringify(items)); },
  add(product,quantity=1){
    const items = this.get();
    const existing = items.find(i=>i.productId===product.id);
    const qty = Math.min(quantity, product.stock);
    if(existing){ existing.quantity = Math.min(existing.quantity + qty, product.stock); }
    else items.push({ productId: product.id, name: product.name, price: product.price, quantity: qty });
    this.set(items);
    ui.updateCartBadge();
  },
  remove(productId){
    const items = this.get().filter(i=>i.productId!==productId);
    this.set(items); ui.updateCartBadge();
  },
  update(productId,quantity){
    const items = this.get();
    const it = items.find(i=>i.productId===productId); if(!it) return;
    it.quantity = Math.max(1, Number(quantity||1));
    this.set(items); ui.updateCartBadge();
  },
  clear(){ this.set([]); ui.updateCartBadge(); }
};

const ui = {
  qs(sel){ return document.querySelector(sel); },
  qsa(sel){ return [...document.querySelectorAll(sel)]; },
  money(n){ return new Intl.NumberFormat('es-ES',{style:'currency',currency:'USD'}).format(n); },
  updateCartBadge(){ this.qs('#cartCount') && (this.qs('#cartCount').textContent = cart.get().reduce((a,b)=>a+b.quantity,0)); },
  renderProducts(list){
    const grid = this.qs('#grid'); if(!grid) return;
    const isEcoMode = localStorage.getItem('super_eco_v1') === 'true';
    grid.innerHTML = list.map(p=>`
      <article class="card product">
        ${isEcoMode && p.isEco ? '<div class="eco-badge">🌿 Eco</div>' : ''}
        <img src="${p.image||''}" alt="${p.name}" data-open="${p.id}">
        <h3>${p.name}</h3>
        <div class="muted">${p.category||''}</div>
        <div class="row" style="align-items:center;justify-content:space-between">
          <span class="price">${this.money(p.price)}</span>
          <button class="btn" data-add="${p.id}" ${p.stock<=0?'disabled':''}>Añadir</button>
        </div>
      </article>
    `).join('');
    grid.onclick = async (e)=>{
      const addId = e.target.dataset.add;
      const openId = e.target.dataset.open;
      if(addId){ const p = await api.getProduct(addId); cart.add(p,1); this.openCart(); this.renderCart(); return; }
      if(openId){ const p = await api.getProduct(openId); openProductModal(p); }
    };
  },
  renderCart(){
    const panel = this.qs('#cartPanel'); if(!panel) return;
    const items = cart.get();
    const container = this.qs('#cartItems');
    const total = items.reduce((s,i)=>s+i.price*i.quantity,0);
    container.innerHTML = items.length? items.map(i=>`
      <div class="row" style="justify-content:space-between;align-items:center;margin:6px 0">
        <div>${i.name}</div>
        <input type="number" min="1" value="${i.quantity}" data-q="${i.productId}" style="width:80px">
        <div>${this.money(i.price*i.quantity)}</div>
        <button class="btn" data-rm="${i.productId}">Quitar</button>
      </div>
    `).join('') : '<div class="muted">Tu carrito está vacío</div>';
    this.qs('#cartTotal').textContent = this.money(total);
    container.oninput = (e)=>{ const id = Number(e.target.dataset.q); if(!id) return; cart.update(id, Number(e.target.value)); this.renderCart(); };
    container.onclick = (e)=>{ const id = Number(e.target.dataset.rm); if(!id) return; cart.remove(id); this.renderCart(); };
  },
  openCart(){ this.qs('#cartPanel')?.classList.remove('hidden'); },
  closeCart(){ this.qs('#cartPanel')?.classList.add('hidden'); }
};

// Página principal
async function bootIndex(){
  console.log('Iniciando bootIndex...');
  ui.updateCartBadge();
  
  // Mostrar/ocultar enlace admin según autenticación
  const adminLink = ui.qs('.admin-link');
  if (adminLink) {
    if (auth.isAdmin()) {
      adminLink.classList.remove('hidden');
    } else {
      adminLink.classList.add('hidden');
    }
  }
  
  // Actualizar iconos de modo
  updateModeIcons();
  
  const search = ui.qs('#search');
  let currentCategory = '';
  const features = ui.qs('#features');
  const cats = ui.qs('#categories');
  
  console.log('Elementos encontrados:', { search, features, cats });
  
  async function load(){
    console.log('Cargando productos...');
    try {
      const list = await api.listProducts({ q: search?.value||'', category: currentCategory||'' });
      console.log('Productos cargados:', list.length);
      ui.renderProducts(list);
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  }
  // Features y categorías demo visual
  if(features){
    features.innerHTML = `
      <div class="card"><strong>Entrega en 2 Horas</strong><div class="muted">Rápido y confiable</div></div>
      <div class="card"><strong>100% Orgánico</strong><div class="muted">Calidad de granja</div></div>
      <div class="card"><strong>Mejores Precios</strong><div class="muted">Ahorra hasta 40%</div></div>
    `;
  }
  if(cats){
    const options = [
      {emoji:'🧺',name:'Todas',value:''},
      {emoji:'🍎',name:'Frutas',value:'Frutas'},
      {emoji:'🥛',name:'Lácteos',value:'Lácteos'},
      {emoji:'🍞',name:'Panadería',value:'Panadería'},
      {emoji:'🥚',name:'Huevos',value:'Huevos'},
      {emoji:'🥤',name:'Bebidas',value:'Bebidas'}
    ];
    cats.innerHTML = options.map((o,i)=>`<button class="cat ${i===0?'active':''}" data-cat="${o.value}"><div class="emoji">${o.emoji}</div><div>${o.name}</div></button>`).join('');
    cats.onclick = (e)=>{
      const el = e.target.closest('[data-cat]'); if(!el) return;
      currentCategory = el.dataset.cat;
      cats.querySelectorAll('.cat').forEach(c=>c.classList.remove('active'));
      el.classList.add('active');
      load();
    };
  }
  search?.addEventListener('input', debounce(load, 250));
  // categorías con botones; no select
  ui.qs('#cartIcon')?.addEventListener('click', ()=>{ ui.renderCart(); ui.openCart(); });
  ui.qs('#closeCart')?.addEventListener('click', ()=> ui.closeCart());
  ui.qs('#shopNow')?.addEventListener('click', ()=> document.querySelector('#grid')?.scrollIntoView({behavior:'smooth'}));
  ui.qs('#learnMore')?.addEventListener('click', ()=> document.querySelector('#features')?.scrollIntoView({behavior:'smooth'}));
  ui.qs('.logo')?.addEventListener('click', ()=> window.scrollTo({top:0,behavior:'smooth'}));
  ui.qs('#themeToggle')?.addEventListener('click', toggleTheme);
  ui.qs('#ecoToggle')?.addEventListener('click', ()=>{ toggleEcoMode(); load(); });
  ui.qs('#accountIcon')?.addEventListener('click', openAccountModal);
  ui.qs('#checkoutBtn')?.addEventListener('click', async ()=>{
    const items = cart.get(); if(!items.length) return;
    const payload = items.map(i=>({ productId:i.productId, quantity:i.quantity }));
    const res = await api.createOrder(payload);
    alert('Pedido creado #' + res.id + ' por ' + ui.money(res.total));
    cart.clear(); ui.renderCart(); load();
  });
  await load();
  console.log('bootIndex completado');
}

// Página admin
async function bootAdmin(){
  const listEl = ui.qs('#adminList'); if(!listEl) return;
  
  // Variables para búsqueda
  let currentSearch = '';
  let currentCategory = '';
  
  async function load(){
    const prods = await api.listProducts({ q: currentSearch, category: currentCategory });
    listEl.innerHTML = prods.map(p=>`
      <div class="table-item">
        <div><strong>${p.name}</strong><br><small class="muted">${p.description||''}</small></div>
        <div>${ui.money(p.price)}</div>
        <div>${p.stock}</div>
        <div>${p.category||''}</div>
        <div class="eco-indicator">${p.isEco ? '🌿 Sí' : '❌ No'}</div>
        <div class="table-actions">
          <button class="btn" data-ed="${p.id}">✏️ Editar</button>
          <button class="btn" data-del="${p.id}">🗑️ Eliminar</button>
        </div>
      </div>
    `).join('');
  }
  
  // Event listeners para búsqueda
  const searchInput = ui.qs('#adminSearch');
  const categoryFilter = ui.qs('#adminCategoryFilter');
  const searchBtn = ui.qs('#adminSearchBtn');
  const clearBtn = ui.qs('#adminClearBtn');
  
  searchBtn?.addEventListener('click', () => {
    currentSearch = searchInput?.value || '';
    currentCategory = categoryFilter?.value || '';
    load();
  });
  
  clearBtn?.addEventListener('click', () => {
    currentSearch = '';
    currentCategory = '';
    if(searchInput) searchInput.value = '';
    if(categoryFilter) categoryFilter.value = '';
    load();
  });
  
  searchInput?.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') {
      currentSearch = searchInput.value;
      currentCategory = categoryFilter?.value || '';
      load();
    }
  });
  
  categoryFilter?.addEventListener('change', () => {
    currentCategory = categoryFilter.value;
    load();
  });

  listEl.onclick = async (e)=>{
    const idEd = e.target.dataset.ed; const idDel = e.target.dataset.del;
    if(idEd){ fillForm(await api.getProduct(idEd)); }
    if(idDel){ if(confirm('¿Eliminar producto?')){ await api.deleteProduct(idDel); await load(); } }
  };

  function fillForm(p){
    ui.qs('#productId').value = p.id;
    ui.qs('#name').value = p.name;
    ui.qs('#description').value = p.description||'';
    ui.qs('#price').value = p.price;
    ui.qs('#stock').value = p.stock;
    ui.qs('#category').value = p.category||'';
    ui.qs('#image').value = p.image||'';
    ui.qs('#isEco').checked = p.isEco == 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ui.qs('#resetBtn')?.addEventListener('click', ()=> document.getElementById('productForm').reset());

  ui.qs('#productForm')?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const payload = {
      name: ui.qs('#name').value.trim(),
      description: ui.qs('#description').value.trim(),
      price: Number(ui.qs('#price').value),
      stock: Number(ui.qs('#stock').value),
      category: ui.qs('#category').value.trim(),
      image: ui.qs('#image').value.trim(),
      isEco: ui.qs('#isEco').checked ? 1 : 0
    };
    const id = ui.qs('#productId').value;
    if(id){ await api.updateProduct(id, payload); }
    else { await api.createProduct(payload); }
    document.getElementById('productForm').reset();
    await load();
  });

  await load();
  
  // Logout button
  ui.qs('#logoutBtn')?.addEventListener('click', () => {
    auth.logout();
    window.location.href = '/';
  });
}

function debounce(fn, ms){
  let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), ms); };
}

// boot
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM cargado, iniciando aplicación...');
  if(document.location.pathname === '/admin.html') {
    console.log('Cargando admin...');
    if (auth.checkAdmin()) bootAdmin();
  }
  else {
    console.log('Cargando página principal...');
    bootIndex();
  }
});

// Modal producto
function openProductModal(p){
  const overlay = document.getElementById('overlay');
  const modal = document.getElementById('productModal');
  if(!overlay || !modal) return;
  document.getElementById('pmTitle').textContent = p.name;
  document.getElementById('pmImg').src = p.image||'';
  document.getElementById('pmDesc').textContent = p.description||'';
  document.getElementById('pmPrice').textContent = ui.money(p.price);
  document.getElementById('pmAdd').onclick = ()=>{ cart.add(p,1); ui.renderCart(); ui.openCart(); closeModal(); };
  document.getElementById('pmClose').onclick = closeModal;
  overlay.onclick = closeModal;
  overlay.classList.remove('hidden');
  modal.classList.remove('hidden');
}
function openAccountModal(){
  const overlay = document.getElementById('overlay');
  const modal = document.getElementById('accountModal');
  if(!overlay || !modal) return;
  
  // Resetear formularios
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('registerForm').classList.add('hidden');
  document.getElementById('loginTab').classList.add('active');
  document.getElementById('registerTab').classList.remove('active');
  
  // Event listeners para tabs
  document.getElementById('loginTab').onclick = () => {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginTab').classList.add('active');
    document.getElementById('registerTab').classList.remove('active');
    document.getElementById('modalTitle').textContent = 'Bienvenido/a – ingresa a tu cuenta';
    document.getElementById('modalSubtitle').textContent = 'Inicia sesión o crea una cuenta para continuar con tu compra';
  };
  
  document.getElementById('registerTab').onclick = () => {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('loginTab').classList.remove('active');
    document.getElementById('registerTab').classList.add('active');
    document.getElementById('modalTitle').textContent = 'Crear nueva cuenta';
    document.getElementById('modalSubtitle').textContent = 'Únete a SuperMercado y disfruta de productos frescos';
  };
  
  // Event listeners para formularios
  document.getElementById('amClose').onclick = closeModal;
  
  document.getElementById('amLogin').onclick = ()=>{
    const email = document.getElementById('amEmail').value;
    const password = document.getElementById('amPass').value;
    if(auth.login(email, password)){
      closeModal();
      // Actualizar UI para mostrar admin link si es admin
      const adminLink = document.querySelector('.admin-link');
      if(adminLink && auth.isAdmin()){
        adminLink.classList.remove('hidden');
      }
      alert('Bienvenido, ' + email);
    } else {
      alert('Credenciales incorrectas');
    }
  };
  
  document.getElementById('amRegister').onclick = ()=>{
    const name = document.getElementById('amName').value;
    const email = document.getElementById('amEmailReg').value;
    const password = document.getElementById('amPassReg').value;
    
    if(!name || !email || !password){
      alert('Por favor completa todos los campos');
      return;
    }
    
    // Simular registro exitoso
    alert('¡Cuenta creada exitosamente! Bienvenido/a, ' + name);
    closeModal();
    
    // Limpiar formularios
    document.getElementById('amName').value = '';
    document.getElementById('amEmailReg').value = '';
    document.getElementById('amPassReg').value = '';
  };
  
  overlay.onclick = closeModal;
  overlay.classList.remove('hidden');
  modal.classList.remove('hidden');
}
function closeModal(){
  document.getElementById('overlay')?.classList.add('hidden');
  document.getElementById('productModal')?.classList.add('hidden');
  document.getElementById('accountModal')?.classList.add('hidden');
}

// Modos de tema
const themeKey = 'super_theme_v1';
const ecoKey = 'super_eco_v1';

function applyTheme(t){ 
  document.documentElement.setAttribute('data-theme', t); 
  updateModeIcons();
}

function toggleTheme(){ 
  const t = (localStorage.getItem(themeKey)||'light')==='light'?'dark':'light'; 
  localStorage.setItem(themeKey,t); 
  applyTheme(t); 
}

function toggleEcoMode(){
  const isEco = localStorage.getItem(ecoKey) === 'true';
  const newEco = !isEco;
  localStorage.setItem(ecoKey, newEco);
  document.documentElement.setAttribute('data-eco', newEco);
  updateModeIcons();
}

function updateModeIcons(){
  const themeToggle = document.getElementById('themeToggle');
  const ecoToggle = document.getElementById('ecoToggle');
  
  if (themeToggle) {
    const isDark = localStorage.getItem(themeKey) === 'dark';
    themeToggle.textContent = isDark ? '☀️' : '🌙';
  }
  
  if (ecoToggle) {
    const isEco = localStorage.getItem(ecoKey) === 'true';
    ecoToggle.textContent = isEco ? '🌿' : '🌱';
    ecoToggle.style.color = isEco ? '#22c55e' : 'var(--muted)';
  }
}

// Aplicar temas al cargar
applyTheme(localStorage.getItem(themeKey)||'light');
document.documentElement.setAttribute('data-eco', localStorage.getItem(ecoKey) === 'true');


