// SuperMercado App - Versión Funcional
console.log('SuperMercado App iniciando...');

// UI Helper
const ui = {
  qs(sel) { return document.querySelector(sel); },
  qsa(sel) { return [...document.querySelectorAll(sel)]; },
  money(n) { return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(n); },
  
  updateCartBadge() {
    const badge = this.qs('#cartCount');
    if (badge) {
      const count = cart.get().reduce((a, b) => a + b.quantity, 0);
      badge.textContent = count;
    }
  },
  
  renderProducts(list) {
    const grid = this.qs('#grid');
    if (!grid) {
      console.error('Grid no encontrado');
      return;
    }
    
    console.log('Renderizando', list.length, 'productos');
    
    const isEcoMode = localStorage.getItem('super_eco_v1') === 'true';
    
    grid.innerHTML = list.map(p => `
      <article class="card product">
        ${p.isEco == 1 ? '<div class="eco-badge">🌿 Eco</div>' : ''}
        <img src="${p.image || ''}" alt="${p.name}" loading="lazy">
        <h3>${p.name}</h3>
        <div class="muted">${p.category || ''}</div>
        <div class="row" style="align-items:center;justify-content:space-between">
          <span class="price">${this.money(p.price)}</span>
          <button class="btn" data-add="${p.id}" ${p.stock <= 0 ? 'disabled' : ''}>
            ${p.stock <= 0 ? 'Sin Stock' : 'Añadir'}
          </button>
        </div>
      </article>
    `).join('');
    
    // Event listener para botones de añadir (solo si no existe)
    if (!grid.hasAttribute('data-listener-added')) {
      grid.setAttribute('data-listener-added', 'true');
      grid.onclick = async (e) => {
        const addId = e.target.dataset.add;
        if (addId) {
          try {
            const product = await api.getProduct(addId);
            cart.add(product, 1);
            this.updateCartBadge();
            this.renderCart();
            this.openCart();
            console.log('Producto añadido:', product.name);
          } catch (error) {
            console.error('Error añadiendo producto:', error);
            alert('Error al añadir producto');
          }
        }
      };
    }
  },
  
  renderCart() {
    const cartPanel = this.qs('#cartPanel');
    const cartItems = this.qs('#cartItems');
    const cartTotal = this.qs('#cartTotal');
    
    if (!cartPanel || !cartItems) return;
    
    const items = cart.get();
    
    if (items.length === 0) {
      cartItems.innerHTML = '<div class="empty-cart">Carrito vacío</div>';
      if (cartTotal) cartTotal.textContent = this.money(0);
      return;
    }
    
    cartItems.innerHTML = items.map(item => `
      <div class="cart-item">
        <div class="item-image">
          <img src="${item.image || ''}" alt="${item.name}" loading="lazy">
        </div>
        <div class="item-info">
          <h4>${item.name}</h4>
          <p>${this.money(item.price)}</p>
        </div>
        <div class="item-controls">
          <button class="btn" data-remove="${item.productId}" title="Quitar uno">-</button>
          <span>${item.quantity}</span>
          <button class="btn" data-add="${item.productId}" title="Añadir uno">+</button>
          <button class="btn" data-delete="${item.productId}" title="Eliminar del carrito" style="margin-left: 8px; background: #ef4444; color: white;">🗑️</button>
        </div>
      </div>
    `).join('');
    
    // Event listeners para controles del carrito
    cartItems.onclick = (e) => {
      const addId = e.target.dataset.add;
      const removeId = e.target.dataset.remove;
      const deleteId = e.target.dataset.delete;
      
      if (addId) {
        const item = items.find(i => i.productId == addId);
        if (item) {
          cart.add(item, 1);
          this.renderCart();
          this.updateCartBadge();
        }
      }
      
      if (removeId) {
        const item = items.find(i => i.productId == removeId);
        if (item && item.quantity > 1) {
          cart.add(item, -1); // Restar uno
          this.renderCart();
          this.updateCartBadge();
        }
      }
      
      if (deleteId) {
        console.log('Delete button clicked, productId:', deleteId);
        console.log('Current cart items:', items);
        if (confirm('¿Eliminar este producto del carrito?')) {
          console.log('User confirmed deletion');
          cart.remove(deleteId);
          this.renderCart();
          this.updateCartBadge();
          console.log('Cart after removal:', cart.get());
        }
      }
    };
    
    // Actualizar total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotal) cartTotal.textContent = this.money(total);
  },
  
  openCart() { 
    const cartPanel = this.qs('#cartPanel');
    if (cartPanel) cartPanel.classList.remove('hidden');
  },
  
  closeCart() { 
    const cartPanel = this.qs('#cartPanel');
    if (cartPanel) cartPanel.classList.add('hidden');
  }
};

// Cart Helper
const cart = {
  key: 'super_cart_v1',
  
  get() {
    try {
      const data = localStorage.getItem(this.key);
      if (!data) return [];
      const parsed = JSON.parse(data);
      // Verificar que los datos sean válidos
      if (!Array.isArray(parsed)) {
        console.warn('Cart data is not an array, clearing...');
        localStorage.removeItem(this.key);
        return [];
      }
      return parsed.filter(item => 
        item && 
        typeof item.productId !== 'undefined' && 
        typeof item.name === 'string' && 
        typeof item.price === 'number' && 
        typeof item.quantity === 'number' &&
        item.quantity > 0
      );
    } catch (error) {
      console.error('Error parsing cart data:', error);
      // Limpiar datos corruptos
      localStorage.removeItem(this.key);
      return [];
    }
  },
  
  add(product, quantity = 1) {
    const items = this.get();
    const existing = items.find(i => i.productId === product.id);
    
    if (existing) {
      existing.quantity += quantity;
      // Si la cantidad llega a 0 o menos, eliminar el item
      if (existing.quantity <= 0) {
        const filtered = items.filter(i => i.productId !== product.id);
        localStorage.setItem(this.key, JSON.stringify(filtered));
        return;
      }
    } else {
      // Solo añadir si la cantidad es positiva
      if (quantity > 0) {
        items.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity
        });
      }
    }
    
    localStorage.setItem(this.key, JSON.stringify(items));
  },
  
  remove(productId) {
    console.log('Removing product:', productId, 'type:', typeof productId);
    const items = this.get();
    console.log('Items before removal:', items.map(i => ({ id: i.productId, type: typeof i.productId })));
    const filtered = items.filter(i => {
      const match = i.productId != productId; // Usar != para comparación flexible
      console.log(`Comparing ${i.productId} (${typeof i.productId}) with ${productId} (${typeof productId}): ${match}`);
      return match;
    });
    console.log('Items after removal:', filtered);
    localStorage.setItem(this.key, JSON.stringify(filtered));
  },
  
  clear() {
    localStorage.removeItem(this.key);
  },
  
  // Función para limpiar datos corruptos
  reset() {
    console.log('Resetting cart due to corruption...');
    localStorage.removeItem(this.key);
  }
};

// API Helper
const api = {
  async listProducts(params = {}) {
    try {
      const qs = new URLSearchParams(params).toString();
      const url = `/api/products${qs ? `?${qs}` : ''}`;
      console.log('Fetching:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API response:', data.length, 'productos');
      return data;
    } catch (error) {
      console.error('Error en API listProducts:', error);
      throw error;
    }
  },
  
  async getProduct(id) {
    try {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error en API getProduct:', error);
      throw error;
    }
  },
  
  async createOrder(items) {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en API createOrder:', error);
      throw error;
    }
  },
  
  // Product CRUD methods
  async createProduct(productData) {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en API createProduct:', error);
      throw error;
    }
  },
  
  async updateProduct(id, productData) {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en API updateProduct:', error);
      throw error;
    }
  },
  
  async deleteProduct(id) {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en API deleteProduct:', error);
      throw error;
    }
  },
  
  // Category CRUD methods
  async listCategories() {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error en API listCategories:', error);
      throw error;
    }
  },
  
  async createCategory(categoryData) {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en API createCategory:', error);
      throw error;
    }
  },
  
  async getCategory(id) {
    try {
      const response = await fetch(`/api/categories/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error en API getCategory:', error);
      throw error;
    }
  },
  
  async updateCategory(id, categoryData) {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en API updateCategory:', error);
      throw error;
    }
  },
  
  async deleteCategory(id) {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en API deleteCategory:', error);
      throw error;
    }
  }
};

// Auth Helper
const auth = {
  key: 'super_auth_v1',
  currentUser: null,
  
  async login(email, password) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const user = await response.json();
        this.currentUser = user;
        localStorage.setItem(this.key, JSON.stringify(user));
        localStorage.setItem('currentUserId', user.id);
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error) {
      throw error;
    }
  },
  
  async register(name, email, password) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      if (response.ok) {
        const user = await response.json();
        this.currentUser = user;
        localStorage.setItem(this.key, JSON.stringify(user));
        localStorage.setItem('currentUserId', user.id);
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error) {
      throw error;
    }
  },
  
  logout() {
    this.currentUser = null;
    localStorage.removeItem(this.key);
    localStorage.removeItem('currentUserId');
  },
  
  isLoggedIn() {
    const user = localStorage.getItem(this.key);
    if (user) {
      try {
        this.currentUser = JSON.parse(user);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  },
  
  isAdmin() {
    return this.currentUser && this.currentUser.isAdmin === 1;
  }
};

// Theme Helper
const theme = {
  key: 'super_theme_v1',
  
  apply(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem(this.key, themeName);
    
    const toggle = ui.qs('#themeToggle');
    if (toggle) {
      toggle.textContent = themeName === 'dark' ? '☀️' : '🌙';
    }
  },
  
  toggle() {
    const current = localStorage.getItem(this.key) || 'light';
    const newTheme = current === 'light' ? 'dark' : 'light';
    this.apply(newTheme);
  }
};

// Eco Mode Helper
const ecoMode = {
  key: 'super_eco_v1',
  
  apply(isEco) {
    document.documentElement.setAttribute('data-eco', isEco);
    localStorage.setItem(this.key, isEco);
    
    const toggle = ui.qs('#ecoToggle');
    if (toggle) {
      toggle.textContent = isEco ? '🌿' : '🌱';
      toggle.style.color = isEco ? '#22c55e' : 'var(--muted)';
    }
  },
  
  toggle() {
    const current = localStorage.getItem(this.key) === 'true';
    const newMode = !current;
    this.apply(newMode);
    return newMode;
  }
};

// Modal Helper
function openAccountModal() {
  const overlay = ui.qs('#overlay');
  const modal = ui.qs('#accountModal');
  
  if (!overlay || !modal) {
    console.error('Modal elements not found');
    return;
  }
  
  // Reset forms
  const loginForm = ui.qs('#loginForm');
  const registerForm = ui.qs('#registerForm');
  const loginTab = ui.qs('#loginTab');
  const registerTab = ui.qs('#registerTab');
  const modalTitle = ui.qs('#modalTitle');
  const modalSubtitle = ui.qs('#modalSubtitle');
  
  if (loginForm) loginForm.classList.remove('hidden');
  if (registerForm) registerForm.classList.add('hidden');
  if (loginTab) loginTab.classList.add('active');
  if (registerTab) registerTab.classList.remove('active');
  
  // Reset titles
  if (modalTitle) modalTitle.textContent = 'Bienvenido/a – ingresa a tu cuenta';
  if (modalSubtitle) modalSubtitle.textContent = 'Inicia sesión o crea una cuenta para continuar con tu compra';
  
  // Clear forms
  ui.qs('#amEmail') && (ui.qs('#amEmail').value = '');
  ui.qs('#amPass') && (ui.qs('#amPass').value = '');
  ui.qs('#amName') && (ui.qs('#amName').value = '');
  ui.qs('#amEmailReg') && (ui.qs('#amEmailReg').value = '');
  ui.qs('#amPassReg') && (ui.qs('#amPassReg').value = '');
  
  // Tab switching
  if (loginTab) {
    loginTab.onclick = () => {
      loginForm?.classList.remove('hidden');
      registerForm?.classList.add('hidden');
      loginTab.classList.add('active');
      registerTab?.classList.remove('active');
      if (modalTitle) modalTitle.textContent = 'Bienvenido/a – ingresa a tu cuenta';
      if (modalSubtitle) modalSubtitle.textContent = 'Inicia sesión o crea una cuenta para continuar con tu compra';
    };
  }
  
  if (registerTab) {
    registerTab.onclick = () => {
      loginForm?.classList.add('hidden');
      registerForm?.classList.remove('hidden');
      loginTab?.classList.remove('active');
      registerTab.classList.add('active');
      if (modalTitle) modalTitle.textContent = 'Crear nueva cuenta';
      if (modalSubtitle) modalSubtitle.textContent = 'Únete a SuperMercado y disfruta de productos frescos';
    };
  }
  
  // Event listeners
  ui.qs('#amClose')?.addEventListener('click', closeModal);
  
  ui.qs('#amLogin')?.addEventListener('click', async () => {
    const email = ui.qs('#amEmail')?.value;
    const password = ui.qs('#amPass')?.value;
    
    if (!email || !password) {
      alert('Por favor completa todos los campos');
      return;
    }
    
    try {
      await auth.login(email, password);
      closeModal();
      updateUserUI();
      alert('Bienvenido, ' + auth.currentUser.name);
    } catch (error) {
      alert(error.message);
    }
  });
  
  ui.qs('#amRegister')?.addEventListener('click', async () => {
    const name = ui.qs('#amName')?.value;
    const email = ui.qs('#amEmailReg')?.value;
    const password = ui.qs('#amPassReg')?.value;
    
    if (!name || !email || !password) {
      alert('Por favor completa todos los campos');
      return;
    }
    
    try {
      await auth.register(name, email, password);
      closeModal();
      updateUserUI();
      alert('¡Cuenta creada exitosamente! Bienvenido/a, ' + name);
    } catch (error) {
      alert(error.message);
    }
  });
  
  overlay.onclick = closeModal;
  overlay.classList.remove('hidden');
  modal.classList.remove('hidden');
}

function closeModal() {
  ui.qs('#overlay')?.classList.add('hidden');
  ui.qs('#productModal')?.classList.add('hidden');
  ui.qs('#accountModal')?.classList.add('hidden');
}

function updateUserUI() {
  const accountIcon = ui.qs('#accountIcon');
  const profileLink = ui.qs('.profile-link');
  const adminLink = ui.qs('.admin-link');
  
  if (auth.isLoggedIn()) {
    if (accountIcon) accountIcon.style.display = 'none';
    if (profileLink) profileLink.classList.remove('hidden');
    if (adminLink && auth.isAdmin()) {
      adminLink.classList.remove('hidden');
    }
  } else {
    if (accountIcon) accountIcon.style.display = 'block';
    if (profileLink) profileLink.classList.add('hidden');
    if (adminLink) adminLink.classList.add('hidden');
  }
}

// Debounce helper
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Main function
async function bootIndex() {
  console.log('Iniciando bootIndex...');
  
  try {
    // Update cart badge
    ui.updateCartBadge();
    
    // Initialize auth
    auth.isLoggedIn();
    updateUserUI();
    
    // Apply saved themes
    const savedTheme = localStorage.getItem(theme.key) || 'light';
    theme.apply(savedTheme);
    
    const savedEco = localStorage.getItem(ecoMode.key) === 'true';
    ecoMode.apply(savedEco);
    
  // Load features
  const features = ui.qs('#features');
  if (features) {
    features.innerHTML = `
      <div class="feature-card">
        <div class="feature-icon delivery">
          <span class="icon-symbol">⏰</span>
        </div>
        <div class="feature-content">
          <h3>Entrega en 2 Horas</h3>
          <p>Rápido y confiable</p>
        </div>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon organic">
          <span class="icon-symbol">🌿</span>
        </div>
        <div class="feature-content">
          <h3>100% Orgánico</h3>
          <p>Calidad de granja</p>
        </div>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon prices">
          <span class="icon-symbol">💰</span>
        </div>
        <div class="feature-content">
          <h3>Mejores Precios</h3>
          <p>Ahorra hasta 40%</p>
        </div>
      </div>
    `;
    console.log('Features cargadas');
  }
    
    // Load categories
    const categories = ui.qs('#categories');
    if (categories) {
      const options = [
        {emoji:'🧺',name:'Todas',value:''},
        {emoji:'🍎',name:'Frutas',value:'Frutas'},
        {emoji:'🥛',name:'Lácteos',value:'Lácteos'},
        {emoji:'🍞',name:'Panadería',value:'Panadería'},
        {emoji:'🥚',name:'Huevos',value:'Huevos'},
        {emoji:'🥤',name:'Bebidas',value:'Bebidas'}
      ];
      
      categories.innerHTML = options.map((o, i) => `
        <button class="cat ${i === 0 ? 'active' : ''}" data-cat="${o.value}">
          <div class="emoji">${o.emoji}</div>
          <div>${o.name}</div>
        </button>
      `).join('');
      
      console.log('Categorías cargadas');
      
      // Category click handler
      categories.onclick = (e) => {
        const el = e.target.closest('[data-cat]');
        if (!el) return;
        
        const category = el.dataset.cat;
        categories.querySelectorAll('.cat').forEach(c => c.classList.remove('active'));
        el.classList.add('active');
        
        loadProducts(category);
      };
    }
    
    // Load products function
    async function loadProducts(category = '') {
      try {
        console.log('Cargando productos para categoría:', category);
        const products = await api.listProducts({ category });
        ui.renderProducts(products);
        console.log('Productos renderizados:', products.length);
      } catch (error) {
        console.error('Error cargando productos:', error);
        const grid = ui.qs('#grid');
        if (grid) {
          grid.innerHTML = '<div class="error">Error cargando productos. Intenta recargar la página.</div>';
        }
      }
    }
    
    // Event listeners
    const search = ui.qs('#search');
    if (search) {
      search.addEventListener('input', debounce(() => {
        const query = search.value;
        loadProducts(query ? '' : ''); // For now, just reload all
      }, 300));
    }
    
    ui.qs('#cartIcon')?.addEventListener('click', () => {
      ui.renderCart();
      ui.openCart();
    });
    
    ui.qs('#closeCart')?.addEventListener('click', () => ui.closeCart());
    
    ui.qs('#themeToggle')?.addEventListener('click', () => theme.toggle());
    
    ui.qs('#ecoToggle')?.addEventListener('click', () => {
      ecoMode.toggle();
      loadProducts(); // Reload to show eco badges
    });
    
    ui.qs('#accountIcon')?.addEventListener('click', openAccountModal);
    
    ui.qs('#checkoutBtn')?.addEventListener('click', async () => {
      const items = cart.get();
      if (!items.length) {
        alert('Carrito vacío');
        return;
      }
      
      try {
        const payload = items.map(i => ({ productId: i.productId, quantity: i.quantity }));
        const order = await api.createOrder(payload);
        alert('Pedido creado #' + order.id + ' por ' + ui.money(order.total));
        cart.clear();
        ui.renderCart();
        ui.updateCartBadge();
        loadProducts();
      } catch (error) {
        console.error('Error creando pedido:', error);
        alert('Error al crear pedido');
      }
    });
    
    ui.qs('#clearCartBtn')?.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que quieres limpiar el carrito?')) {
        cart.clear();
        ui.renderCart();
        ui.updateCartBadge();
        alert('Carrito limpiado');
      }
    });
    
    // Load initial products
    await loadProducts();
    
    console.log('bootIndex completado exitosamente');
    
  } catch (error) {
    console.error('Error en bootIndex:', error);
  }
}

// Admin function
async function bootAdmin() {
  console.log('Iniciando bootAdmin...');
  
  if (!auth.isLoggedIn() || !auth.isAdmin()) {
    alert('Acceso restringido. Solo administradores.');
    window.location.href = '/';
    return;
  }
  
  try {
    // Cargar categorías
    await loadCategories();
    
    // Cargar productos
    await loadAdminProducts();
    
    // Event listeners para búsqueda
    const searchInput = ui.qs('#adminSearch');
    const categoryFilter = ui.qs('#adminCategoryFilter');
    const searchBtn = ui.qs('#adminSearchBtn');
    const clearBtn = ui.qs('#adminClearBtn');
    
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        const query = searchInput?.value || '';
        const category = categoryFilter?.value || '';
        loadAdminProducts(query, category);
      });
    }
    
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = '';
        loadAdminProducts();
      });
    }
    
    // Event listeners para categorías
    const addCategoryBtn = ui.qs('#addCategory');
    const resetCategoryBtn = ui.qs('#resetCategory');
    
    if (addCategoryBtn) {
      addCategoryBtn.addEventListener('click', async () => {
        const name = ui.qs('#categoryName')?.value;
        const description = ui.qs('#categoryDescription')?.value;
        
        if (!name) {
          alert('El nombre de la categoría es requerido');
          return;
        }
        
        try {
          await api.createCategory({ name, description });
          alert('Categoría creada exitosamente');
          await loadCategories();
          ui.qs('#categoryName').value = '';
          ui.qs('#categoryDescription').value = '';
        } catch (error) {
          console.error('Error creando categoría:', error);
          alert('Error al crear categoría: ' + error.message);
        }
      });
    }
    
    if (resetCategoryBtn) {
      resetCategoryBtn.addEventListener('click', () => {
        ui.qs('#categoryName').value = '';
        ui.qs('#categoryDescription').value = '';
      });
    }
    
    // Event listener para formulario de productos
    const productForm = ui.qs('#productForm');
    if (productForm) {
      productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(productForm);
        const productData = {
          name: formData.get('name'),
          description: formData.get('description'),
          price: parseFloat(formData.get('price')),
          stock: parseInt(formData.get('stock')),
          category: formData.get('category'),
          image: formData.get('image'),
          isEco: formData.get('isEco') === 'on'
        };
        
        const productId = ui.qs('#productId')?.value;
        
        try {
          if (productId) {
            await api.updateProduct(productId, productData);
            alert('Producto actualizado exitosamente');
          } else {
            await api.createProduct(productData);
            alert('Producto creado exitosamente');
          }
          
          productForm.reset();
          ui.qs('#productId').value = '';
          await loadAdminProducts();
        } catch (error) {
          console.error('Error guardando producto:', error);
          alert('Error al guardar producto: ' + error.message);
        }
      });
    }
    
    // Event listener para logout
    const logoutBtn = ui.qs('#logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
          auth.logout();
          window.location.href = '/';
        }
      });
    }
    
    console.log('Admin panel cargado exitosamente');
    
  } catch (error) {
    console.error('Error en bootAdmin:', error);
  }
}

// Función para cargar categorías en el admin
async function loadCategories() {
  try {
    const categories = await api.listCategories();
    const categoriesList = ui.qs('#categoriesList');
    const categorySelect = ui.qs('#category');
    
    if (categoriesList) {
      categoriesList.innerHTML = categories.map(cat => `
        <div class="table-row">
          <span>${cat.name}</span>
          <span>${cat.description || '-'}</span>
          <div class="table-actions">
            <button class="btn" onclick="editCategory(${cat.id})">✏️</button>
            <button class="btn" onclick="deleteCategory(${cat.id})" style="background: #ef4444; color: white;">🗑️</button>
          </div>
        </div>
      `).join('');
    }
    
    if (categorySelect) {
      const currentValue = categorySelect.value;
      categorySelect.innerHTML = '<option value="">Seleccionar categoría</option>' +
        categories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('');
      categorySelect.value = currentValue;
    }
    
    // Actualizar también el filtro de categorías
    const categoryFilter = ui.qs('#adminCategoryFilter');
    if (categoryFilter) {
      const currentFilterValue = categoryFilter.value;
      categoryFilter.innerHTML = '<option value="">Todas las categorías</option>' +
        categories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('');
      categoryFilter.value = currentFilterValue;
    }
    
  } catch (error) {
    console.error('Error cargando categorías:', error);
  }
}

// Función para cargar productos en el admin
async function loadAdminProducts(query = '', category = '') {
  try {
    const products = await api.listProducts({ q: query, category });
    const adminList = ui.qs('#adminList');
    
    if (adminList) {
      adminList.innerHTML = products.map(product => `
        <div class="table-row">
          <div class="product-image">
            <img src="${product.image || ''}" alt="${product.name}" loading="lazy">
          </div>
          <span>${product.name}</span>
          <span>$${product.price}</span>
          <span>${product.stock}</span>
          <span>${product.category || '-'}</span>
          <span>${product.isEco ? '🌿 Sí' : '❌ No'}</span>
          <div class="table-actions">
            <button class="btn" onclick="editProduct(${product.id})">✏️</button>
            <button class="btn" onclick="deleteProduct(${product.id})" style="background: #ef4444; color: white;">🗑️</button>
          </div>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Error cargando productos:', error);
  }
}

// Funciones globales para editar/eliminar
window.editProduct = async function(id) {
  try {
    const product = await api.getProduct(id);
    
    ui.qs('#productId').value = product.id;
    ui.qs('#name').value = product.name;
    ui.qs('#description').value = product.description || '';
    ui.qs('#price').value = product.price;
    ui.qs('#stock').value = product.stock;
    ui.qs('#category').value = product.category || '';
    ui.qs('#image').value = product.image || '';
    ui.qs('#isEco').checked = product.isEco == 1;
    
    // Scroll to form
    ui.qs('#productForm').scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    console.error('Error cargando producto:', error);
    alert('Error al cargar producto');
  }
};

window.deleteProduct = async function(id) {
  if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
    try {
      await api.deleteProduct(id);
      alert('Producto eliminado exitosamente');
      await loadAdminProducts();
    } catch (error) {
      console.error('Error eliminando producto:', error);
      alert('Error al eliminar producto');
    }
  }
};

window.editCategory = async function(id) {
  try {
    const category = await api.getCategory(id);
    
    ui.qs('#categoryName').value = category.name;
    ui.qs('#categoryDescription').value = category.description || '';
    
    // Scroll to form
    ui.qs('#categoryName').scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    console.error('Error cargando categoría:', error);
    alert('Error al cargar categoría');
  }
};

window.deleteCategory = async function(id) {
  if (confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
    try {
      await api.deleteCategory(id);
      alert('Categoría eliminada exitosamente');
      await loadCategories();
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      alert('Error al eliminar categoría');
    }
  }
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM cargado, iniciando aplicación...');
  
  const path = document.location.pathname;
  console.log('Ruta actual:', path);
  
  if (path === '/admin.html') {
    console.log('Cargando admin...');
    bootAdmin();
  } else if (path === '/profile.html') {
    console.log('Cargando perfil...');
    // Profile has its own script
  } else {
    console.log('Cargando página principal...');
    bootIndex();
  }
});

console.log('SuperMercado App cargado');
