/* ============================================================
   SHARED — ShopWave
   Included on every page. Contains tracking, data, cart,
   product cards, modal, toast, nav helpers.
   ============================================================ */

const TRACKING_CONTACT_NO = '923181018154';

/* ---- legacy track() stub (manual calls) ---- */
function track(event, props) {
  console.log('[Analytics]', event, props || '');
}

/* ---- AUTO CLICK TRACKER ---- */
document.addEventListener('click', function(e) {
  let el = e.target;
  while (el && el !== document.documentElement) {
    if (el.dataset && el.dataset.track) {
      const extra = {};
      Array.from(el.attributes).forEach(attr => {
        if (attr.name.startsWith('data-track-') && attr.name !== 'data-track' && attr.name !== 'data-track-form') {
          extra[attr.name.replace('data-track-', '')] = attr.value;
        }
      });
      const payload = {
        contact_no: TRACKING_CONTACT_NO,
        event_name: 'element_click',
        properties: {
          element: el.tagName.toLowerCase(),
          text: (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120),
          track_id: el.dataset.track,
          x: Math.round(e.clientX),
          y: Math.round(e.clientY),
          ...extra
        }
      };
      console.log('[AutoTrack - element_click]', JSON.stringify(payload, null, 2));
      break;
    }
    el = el.parentElement;
  }
}, true);

/* ---- AUTO FORM TRACKER ---- */
document.addEventListener('submit', function(e) {
  const form = e.target;
  if (!form.dataset || !form.dataset.trackForm) return;
  const payload = {
    contact_no: TRACKING_CONTACT_NO,
    event_name: 'form_submit',
    properties: {
      element: 'form',
      form_id: form.id || '',
      track_id: form.dataset.trackForm,
      x: 0,
      y: 0
    }
  };
  console.log('[AutoTrack - form_submit]', JSON.stringify(payload, null, 2));
}, true);

/* ============================================================
   DATA
   ============================================================ */
const PRODUCTS = [
  { id: 1, name: 'Pro Wireless Headphones', category: 'electronics', categoryLabel: 'Electronics', emoji: '🎧', price: 149.99, originalPrice: 199.99, badge: 'Sale', badgeType: 'badge-accent', rating: 4.8, reviews: 2340, description: 'Studio-quality sound meets all-day comfort. Active noise cancellation, 30-hour battery, and a foldable design that goes wherever you do.', features: ['Active Noise Cancellation','30-hour battery life','Bluetooth 5.3','USB-C fast charge','Folds flat for travel'] },
  { id: 2, name: 'Smart Watch Series X',    category: 'electronics', categoryLabel: 'Electronics', emoji: '⌚', price: 299.00, originalPrice: null,   badge: 'New',        badgeType: 'badge-primary', rating: 4.9, reviews: 876,  description: 'Your health, fitness, and notifications — all on your wrist. Always-on display, GPS tracking, and swimproof up to 50 metres.', features: ['Health & fitness tracking','Built-in GPS','50m water resistance','7-day battery','Always-on Retina display'] },
  { id: 3, name: 'Premium Leather Jacket',  category: 'fashion',     categoryLabel: 'Fashion',     emoji: '🧥', price: 189.00, originalPrice: 260.00, badge: '27% Off',    badgeType: 'badge-accent', rating: 4.7, reviews: 1120, description: 'Full-grain leather, tailored fit, and a timeless silhouette. This jacket gets better with every wear.', features: ['Full-grain leather','YKK zippers','Interior zip pocket','Available S–XXL','Colour: Midnight Black'] },
  { id: 4, name: 'Minimalist Desk Lamp',    category: 'home',        categoryLabel: 'Home & Living',emoji: '💡', price: 79.99,  originalPrice: null,   badge: 'Top Rated', badgeType: 'badge-success', rating: 4.6, reviews: 543,  description: 'Warm, flicker-free LED lighting with 5 colour temperatures and stepless dimming. Includes wireless phone charging base.', features: ['5 colour temperatures','Stepless dimming','Wireless charging pad','Touch controls','Memory function'] },
  { id: 5, name: 'Trail Running Shoes',     category: 'sports',      categoryLabel: 'Sports',      emoji: '👟', price: 129.95, originalPrice: 159.95, badge: 'Sale',       badgeType: 'badge-accent', rating: 4.8, reviews: 2015, description: 'Grip, cushion, and responsiveness — built for any terrain. A lightweight upper with a rock-plate midsole keeps you fast on the trails.', features: ['Vibram® outsole','Rock-plate protection','Breathable mesh upper','6mm drop','Unisex sizing'] },
  { id: 6, name: 'Portable Espresso Maker', category: 'home',        categoryLabel: 'Home & Living',emoji: '☕', price: 64.99,  originalPrice: 89.99,  badge: 'Best Seller',badgeType: 'badge-success', rating: 4.5, reviews: 3201, description: 'Barista-quality espresso anywhere — no electricity needed. 18-bar manual pressure, compact enough for a daypack.', features: ['18-bar manual pressure','No electricity needed','Compatible with Nespresso® pods','BPA-free materials','Fits standard cups'] }
];

const CATEGORIES = [
  { name: 'Electronics',   filter: 'electronics', icon: '💻', count: 2 },
  { name: 'Fashion',       filter: 'fashion',      icon: '👗', count: 1 },
  { name: 'Home & Living', filter: 'home',         icon: '🏠', count: 2 },
  { name: 'Sports',        filter: 'sports',       icon: '🏃', count: 1 },
  { name: 'Books',         filter: 'books',        icon: '📚', count: 0 },
  { name: 'Beauty',        filter: 'beauty',       icon: '💄', count: 0 },
];

const TESTIMONIALS = [
  { stars: 5, text: '"Delivery was lightning-fast and the headphones sound absolutely incredible. Best purchase this year!"', name: 'Sarah M.', role: 'Verified Buyer', avatar: '👩' },
  { stars: 5, text: '"The leather jacket fits perfectly and the quality is exactly as described. ShopWave is my go-to store now."', name: 'James K.', role: 'Repeat Customer', avatar: '👨' },
  { stars: 4, text: '"Great prices and the customer support team resolved my query within an hour. Really impressed!"', name: 'Priya L.', role: 'Verified Buyer', avatar: '👩‍💼' },
];

/* ============================================================
   CART — localStorage-based so state persists across pages
   ============================================================ */
function getCart() {
  try { return JSON.parse(localStorage.getItem('shopwave_cart') || '[]'); } catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem('shopwave_cart', JSON.stringify(cart));
  updateNavCartCount();
}

function addToCart(productId, context) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  const cart = getCart();
  const existing = cart.find(i => i.product.id === productId);
  if (existing) { existing.qty++; } else { cart.push({ product, qty: 1 }); }
  saveCart(cart);
  showToast(`🛒 "${product.name}" added to cart!`, 'success');
  track('add_to_cart', { product_id: product.id, product_name: product.name, price: product.price, context });
}

function removeFromCart(productId) {
  let cart = getCart();
  const item = cart.find(i => i.product.id === productId);
  if (!item) return;
  const name = item.product.name;
  cart = cart.filter(i => i.product.id !== productId);
  saveCart(cart);
  if (typeof renderCartItems === 'function') renderCartItems();
  showToast(`🗑️ "${name}" removed from cart.`, 'info');
  track('remove_from_cart', { product_id: productId, product_name: name });
}

function changeQty(productId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.product.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { removeFromCart(productId); return; }
  saveCart(cart);
  if (typeof renderCartItems === 'function') renderCartItems();
  track('cart_qty_change', { product_id: productId, qty: item.qty, delta });
}

function updateNavCartCount() {
  const cart = getCart();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const countEl = document.getElementById('cart-count');
  if (countEl) {
    countEl.textContent = total;
    countEl.classList.toggle('visible', total > 0);
  }
}

/* ============================================================
   NAVIGATION
   ============================================================ */
function navigateTo(section) {
  track('nav_click', { section });
  const map = { home: './index.html', products: './products.html', cart: './cart.html', signup: './signup.html', contact: './contact.html' };
  window.location.href = map[section] || './index.html';
}

function filterAndGo(filter) {
  track('category_click', { category: filter });
  sessionStorage.setItem('shopwave_filter', filter);
  window.location.href = './products.html';
}

function updateNavActiveLink() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  let id = 'nav-home';
  if (path.includes('products')) id = 'nav-products';
  else if (path.includes('cart'))    id = 'nav-cart';
  else if (path.includes('signup'))  id = 'nav-signup';
  else if (path.includes('contact')) id = 'nav-contact';
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function toggleMobileMenu() {
  const links = document.getElementById('nav-links');
  const open = links.classList.toggle('open');
  document.getElementById('hamburger').setAttribute('aria-expanded', open);
  track('mobile_menu_toggle', { opened: open });
}

/* ============================================================
   PRODUCT CARD
   ============================================================ */
function createProductCard(product, context) {
  const div = document.createElement('div');
  div.className = 'product-card';
  div.dataset.productId = product.id;
  div.innerHTML = `
    <div class="product-img-wrap">
      <div class="product-badge"><span class="badge ${product.badgeType}">${product.badge}</span></div>
      <span>${product.emoji}</span>
    </div>
    <div class="product-info">
      <div class="product-category">${product.categoryLabel}</div>
      <div class="product-name">${product.name}</div>
      <div class="product-desc">${product.description.slice(0, 80)}…</div>
      <div class="product-price-row">
        <div>
          <span class="product-price">$${product.price.toFixed(2)}</span>
          ${product.originalPrice ? `<span class="product-original">$${product.originalPrice.toFixed(2)}</span>` : ''}
        </div>
        <span class="product-rating">★ ${product.rating}</span>
      </div>
      <div class="product-actions">
        <button class="btn btn-outline btn-sm"
          data-track="product-view-details"
          data-track-location="${context}"
          data-track-product-id="${product.id}"
          data-track-product-name="${product.name.replace(/"/g,'')}"
          onclick="openModal(${product.id}, '${context}')">View Details</button>
        <button class="btn btn-primary btn-sm"
          data-track="product-add-to-cart"
          data-track-location="${context}"
          data-track-product-id="${product.id}"
          data-track-product-name="${product.name.replace(/"/g,'')}"
          data-track-price="${product.price}"
          data-track-color="purple"
          onclick="addToCart(${product.id}, '${context}')">Add to Cart</button>
      </div>
    </div>
  `;
  return div;
}

/* ============================================================
   MODAL
   ============================================================ */
let modalProduct = null;

function openModal(productId, context) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  modalProduct = product;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('modal-img', product.emoji);
  set('modal-category', product.categoryLabel);
  set('modal-name', product.name);
  set('modal-price', `$${product.price.toFixed(2)}`);
  set('modal-original', product.originalPrice ? `$${product.originalPrice.toFixed(2)}` : '');
  set('modal-desc', product.description);
  const badge = document.getElementById('modal-badge');
  if (badge) badge.innerHTML = `<span class="badge ${product.badgeType}" style="margin-left:8px">${product.badge}</span>`;
  const features = document.getElementById('modal-features');
  if (features) features.innerHTML = product.features.map(f => `<li>${f}</li>`).join('');
  const btn = document.getElementById('modal-add-to-cart-btn');
  if (btn) {
    btn.setAttribute('data-track-product-id', product.id);
    btn.setAttribute('data-track-product-name', product.name);
  }
  const overlay = document.getElementById('modal-overlay');
  if (overlay) { overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
  track('product_detail_view', { product_id: product.id, product_name: product.name, context });
}

function closeModal(e) {
  const overlay = document.getElementById('modal-overlay');
  const closeBtn = document.getElementById('modal-close-btn');
  if (e && e.target !== overlay && e.target !== closeBtn) return;
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
  modalProduct = null;
}

function modalAddToCart() {
  if (!modalProduct) return;
  addToCart(modalProduct.id, 'modal');
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
  modalProduct = null;
}

/* ============================================================
   TOAST
   ============================================================ */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeOut .4s ease forwards';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

/* ============================================================
   CTA HELPERS
   ============================================================ */
function handleLoginLink()      { track('login_link_click', {}); showToast('Login functionality coming soon!', 'info'); }
function handleQuickLink(link)  { track('contact_quick_link_click', { link }); showToast(`"${link.replace('_', ' ')}" section coming soon!`, 'info'); }
function handleSocialClick(pl)  { track('social_click', { platform: pl }); showToast(`Opening ${pl}…`, 'info'); }
function handleFooterLink(link) { track('footer_link_click', { link }); showToast(`"${link}" page coming soon!`, 'info'); }

/* ============================================================
   KEYBOARD — close modal on Escape
   ============================================================ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const overlay = document.getElementById('modal-overlay');
    if (overlay && overlay.classList.contains('open')) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      modalProduct = null;
    }
  }
});

/* ---- run on every page ---- */
document.addEventListener('DOMContentLoaded', () => {
  updateNavCartCount();
  updateNavActiveLink();
  track('page_view', { page: document.title, referrer: document.referrer || 'direct' });
});
