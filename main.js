// ==================== CONFIG ====================
const defaultConfig = {
  brand_name: "Dimcum A'SAM",
  tagline: 'Nikmati cita rasa autentik dimcum',
  promo_text: '✨ Gratis ongkir untuk pemesanan pertama via GoFood & GrabFood!',
};

const WA_NUMBER = '6283893331236';

// ==================== MENU DATA ====================
const menuData = {
  "Dimsum Ayam Original":        { price: 3000,  unit: '/pcs' },
  "Dimsum Mentai":               { price: 20000, unit: '' },
  "Gyoza Ayam Kuah":             { price: 11000, unit: '' },
  "Gyoza Ayam Goreng":           { price: 11000, unit: '' },
  "Gyoza Udang Kuah":            { price: 12000, unit: '' },
  "Gyoza Udang Goreng":          { price: 12000, unit: '' },
  "Gyoza Mentai":                { price: 12000, unit: '' },
  "Wonton Kuah Seblak":          { price: 15000, unit: '' },
  "Wonton Chili Oil":            { price: 13000, unit: '' },
};

// ==================== CART STATE ====================
let cart = {}; // { itemName: qty }

function formatRp(n) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

// ==================== CART LOGIC ====================
function addToCart(itemName) {
  cart[itemName] = (cart[itemName] || 0) + 1;
  renderCart();
  showToast(`✅ ${itemName} ditambahkan!`);
}

function updateQty(itemName, delta) {
  cart[itemName] = (cart[itemName] || 0) + delta;
  if (cart[itemName] <= 0) delete cart[itemName];
  renderCart();
}

function clearCart() {
  cart = {};
  renderCart();
}

function getTotalItems() {
  return Object.values(cart).reduce((a, b) => a + b, 0);
}

function getTotalPrice() {
  return Object.entries(cart).reduce((total, [name, qty]) => {
    const item = menuData[name];
    return total + (item ? item.price * qty : 0);
  }, 0);
}

function renderCart() {
  const itemsEl   = document.getElementById('cart-items');
  const footerEl  = document.getElementById('cart-footer');
  const countEl   = document.getElementById('cart-count');
  const countEl2  = document.getElementById('cart-items-count');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl   = document.getElementById('cart-total');
  const fabEl     = document.getElementById('cart-fab');
  const fabCount  = document.getElementById('cart-count');

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // Update FAB
  if (fabCount) fabCount.textContent = totalItems;
  if (fabEl) fabEl.classList.toggle('show', totalItems > 0);

  // Empty state
  if (totalItems === 0) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <div class="cart-empty-text">Keranjang masih kosong<br><span style="font-size:0.78rem;color:#bbb;">Tambah menu favoritmu!</span></div>
      </div>`;
    footerEl.style.display = 'none';
    return;
  }

  // Render items
  itemsEl.innerHTML = Object.entries(cart).map(([name, qty]) => {
    const item = menuData[name] || { price: 0, unit: '' };
    const subtotal = item.price * qty;
    return `
      <div class="cart-item">
        <div style="flex:1;min-width:0;">
          <div class="cart-item-name">${name}</div>
          <div class="cart-item-price">${formatRp(item.price)}${item.unit}</div>
        </div>
        <div class="cart-qty">
          <button class="cart-qty-btn remove" onclick="updateQty('${name.replace(/'/g,"\\'")}', -1)">−</button>
          <span class="cart-qty-num">${qty}</span>
          <button class="cart-qty-btn" onclick="updateQty('${name.replace(/'/g,"\\'")}', 1)">+</button>
        </div>
        <div class="cart-item-subtotal">${formatRp(subtotal)}</div>
      </div>`;
  }).join('');

  // Update summary
  if (countEl2) countEl2.textContent = `${totalItems} item`;
  if (subtotalEl) subtotalEl.textContent = formatRp(totalPrice);
  if (totalEl) totalEl.textContent = formatRp(totalPrice);
  footerEl.style.display = 'block';
}

// ==================== CHECKOUT WA ====================
function checkoutWA() {
  const nameInput = document.getElementById('cart-customer-name');
  const name = nameInput?.value.trim();

  if (!name) {
    nameInput?.focus();
    nameInput?.classList.add('border-red-400');
    nameInput?.setAttribute('placeholder', '⚠️ Nama wajib diisi dulu!');
    setTimeout(() => {
      nameInput?.classList.remove('border-red-400');
      nameInput?.setAttribute('placeholder', 'Nama kamu (wajib diisi)');
    }, 2500);
    return;
  }

  if (getTotalItems() === 0) return;

  // Build WA message
  const lines = [
    `Halo Dimcum A'SAM!`,
    `Saya *${name}* mau pesan:`,
    '',
    ...Object.entries(cart).map(([itemName, qty]) => {
      const item = menuData[itemName] || { price: 0 };
      return `• ${itemName} x${qty} = ${formatRp(item.price * qty)}`;
    }),
    '',
    `*Total: ${formatRp(getTotalPrice())}*`,
    '',
    `Mohon konfirmasi ketersediaan dan ongkos kirim ya. Terima kasih! 🙏`,
  ];

  const msg = encodeURIComponent(lines.join('\n'));
  window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
}

// ==================== CART DRAWER ====================
function openCart() {
  document.getElementById('cart-overlay').classList.add('open');
  document.getElementById('cart-drawer').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-overlay').classList.remove('open');
  document.getElementById('cart-drawer').classList.remove('open');
  document.body.style.overflow = '';
}

// ==================== TOAST ====================
function showToast(msg) {
  const toast = document.getElementById('cart-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

// ==================== ORDER MODAL ====================
function openOrderModal(itemName) {
  // Kalau datang dari tombol "Pesan" di card → langsung add to cart + tawarin buka keranjang
  addToCart(itemName);
}

function closeOrderModal() {
  document.getElementById('order-modal').classList.remove('active');
  document.body.style.overflow = '';
}

// ==================== PESAN BUTTONS ====================
function attachPesanButtons() {
  document.querySelectorAll('.btn-pesan').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemName = btn.dataset.item || '';
      addToCart(itemName);
    });
  });
  document.querySelectorAll('.btn-pesan-bs').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemName = btn.dataset.item || '';
      addToCart(itemName);
    });
  });
}

// ==================== MOBILE MENU ====================
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  menu.classList.toggle('hidden');
}

// ==================== SCROLL TO TOP ====================
function handleScrollToTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('show', window.scrollY > 320));
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ==================== ELEMENT SDK ====================
async function initElementSdk() {
  if (!window.elementSdk) return;
  window.elementSdk.init({
    defaultConfig,
    onConfigChange: async (cfg) => {
      const b = cfg.brand_name || defaultConfig.brand_name;
      ['brand-name','hero-brand','footer-brand'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = b;
      });
    },
  });
}

// ==================== CINEMATIC HERO SLIDESHOW ====================
function initSlideshow() {
  const slides   = document.querySelectorAll('.hero-slide-item');
  const dots     = document.querySelectorAll('.slide-dot-v');
  const progress = document.getElementById('slide-progress');
  const counter  = document.getElementById('slide-current');
  const DURATION = 5000;
  if (!slides.length) return;

  let current = 0, timer = null;

  function padTwo(n) { return String(n + 1).padStart(2, '0'); }

  function goTo(index, dir = 'right') {
    if (index === current) return;
    const prev = current;
    current = (index + slides.length) % slides.length;
    slides[prev].classList.remove('is-active');
    slides[prev].classList.add(dir === 'right' ? 'exit-left' : 'exit-right');
    slides[current].classList.add(dir === 'right' ? 'enter-right' : 'enter-left');
    setTimeout(() => {
      slides[prev].classList.remove('exit-left', 'exit-right');
      slides[current].classList.remove('enter-right', 'enter-left');
      slides[current].classList.add('is-active');
    }, 900);
    dots.forEach(d => d.classList.remove('active'));
    dots[current]?.classList.add('active');
    if (counter) counter.textContent = padTwo(current);
  }

  function next() { goTo((current + 1) % slides.length, 'right'); }
  function prev() { goTo((current - 1 + slides.length) % slides.length, 'left'); }

  function startProgress() {
    if (!progress) return;
    progress.style.transition = 'none';
    progress.style.width = '0%';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      progress.style.transition = `width ${DURATION}ms linear`;
      progress.style.width = '100%';
    }));
  }

  function startAuto() {
    clearInterval(timer);
    startProgress();
    timer = setInterval(() => { next(); startProgress(); }, DURATION);
  }

  dots.forEach(dot => dot.addEventListener('click', () => {
    goTo(parseInt(dot.dataset.goto), parseInt(dot.dataset.goto) > current ? 'right' : 'left');
    startAuto();
  }));
  document.getElementById('slide-prev')?.addEventListener('click', () => { prev(); startAuto(); });
  document.getElementById('slide-next')?.addEventListener('click', () => { next(); startAuto(); });

  let tx = 0;
  const heroEl = document.getElementById('hero');
  heroEl?.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  heroEl?.addEventListener('touchend', e => {
    const diff = tx - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); startAuto(); }
  });

  startAuto();
}

// ==================== INIT ====================
async function initApp() {
  await initElementSdk();
  handleScrollToTop();
  attachPesanButtons();
  initSlideshow();
  renderCart();

  document.getElementById('mobile-menu-btn')?.addEventListener('click', toggleMobileMenu);
  document.querySelectorAll('#mobile-menu a').forEach(a =>
    a.addEventListener('click', () => document.getElementById('mobile-menu').classList.add('hidden'))
  );
  document.getElementById('modal-close')?.addEventListener('click', closeOrderModal);
}

initApp();

