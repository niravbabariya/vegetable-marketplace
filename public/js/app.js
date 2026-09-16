/**
 * Vegetable — Shared Client Utilities
 * Royal B2B Marketplace
 */

// ── Navigation ──────────────────────────────────────────────────
function showLogin()    { location.href = '/login.html'; }
function showRegister() { location.href = '/register.html'; }

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('veggiCart');
  location.href = '/';
}

function toggleMobileNav() {
  const navbar = document.querySelector('.navbar');
  const toggleBtn = document.querySelector('.nav-toggle');
  if (navbar) {
    const isExpanded = navbar.classList.toggle('nav-open');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', isExpanded);
      toggleBtn.innerHTML = isExpanded ? '✕' : '☰';
    }
  }
}

// ── Comprehensive Produce Dictionary (Vegetables, Fruits, Leafy) ─────
const PRODUCE_DICTIONARY = [
  // 🥦 VEGETABLES
  { name: 'Fresh Tomatoes', mandi: 'Tamatar', category: 'Vegetables', unit: 'kg', icon: '🍅' },
  { name: 'Cherry Tomatoes', mandi: 'Small Tomatoes', category: 'Vegetables', unit: 'kg', icon: '🍅' },
  { name: 'Vine Tomatoes', mandi: 'Desi Tamatar', category: 'Vegetables', unit: 'kg', icon: '🍅' },
  { name: 'Potatoes', mandi: 'Batata / Aloo', category: 'Vegetables', unit: 'kg', icon: '🥔' },
  { name: 'Baby Potatoes', mandi: 'Chota Aloo', category: 'Vegetables', unit: 'kg', icon: '🥔' },
  { name: 'Sweet Potato', mandi: 'Shakarkand', category: 'Vegetables', unit: 'kg', icon: '🍠' },
  { name: 'Red Onion', mandi: 'Lal Pyaz', category: 'Vegetables', unit: 'kg', icon: '🧅' },
  { name: 'White Onion', mandi: 'Safed Pyaz', category: 'Vegetables', unit: 'kg', icon: '🧅' },
  { name: 'Garlic', mandi: 'Lahsun', category: 'Vegetables', unit: 'kg', icon: '🧄' },
  { name: 'Peeled Garlic', mandi: 'Chhila Lahsun', category: 'Vegetables', unit: 'kg', icon: '🧄' },
  { name: 'Ginger', mandi: 'Adrak', category: 'Vegetables', unit: 'kg', icon: '🫚' },
  { name: 'Green Chili', mandi: 'Hari Mirch', category: 'Vegetables', unit: 'kg', icon: '🌶️' },
  { name: 'Red Chili', mandi: 'Lal Mirch', category: 'Vegetables', unit: 'kg', icon: '🌶️' },
  { name: 'Capsicum / Green Bell Pepper', mandi: 'Shimla Mirch', category: 'Vegetables', unit: 'kg', icon: '🫑' },
  { name: 'Red Bell Pepper', mandi: 'Lal Shimla Mirch', category: 'Vegetables', unit: 'kg', icon: '🫑' },
  { name: 'Yellow Bell Pepper', mandi: 'Pili Shimla Mirch', category: 'Vegetables', unit: 'kg', icon: '🫑' },
  { name: 'Cucumber', mandi: 'Kheera / Kakdi', category: 'Vegetables', unit: 'kg', icon: '🥒' },
  { name: 'English Cucumber', mandi: 'Green Cucumber', category: 'Vegetables', unit: 'kg', icon: '🥒' },
  { name: 'Cauliflower', mandi: 'Phool Gobhi', category: 'Vegetables', unit: 'kg', icon: '🥦' },
  { name: 'Cabbage', mandi: 'Patta Gobhi', category: 'Vegetables', unit: 'kg', icon: '🥬' },
  { name: 'Purple Cabbage', mandi: 'Lal Patta Gobhi', category: 'Vegetables', unit: 'kg', icon: '🥬' },
  { name: 'Broccoli', mandi: 'Hari Gobhi', category: 'Vegetables', unit: 'kg', icon: '🥦' },
  { name: 'Brinjal / Eggplant', mandi: 'Baingan', category: 'Vegetables', unit: 'kg', icon: '🍆' },
  { name: 'Small Baingan', mandi: 'Bharta Baingan', category: 'Vegetables', unit: 'kg', icon: '🍆' },
  { name: 'Bhindi / Okra', mandi: 'Lady Finger', category: 'Vegetables', unit: 'kg', icon: '🫛' },
  { name: 'Bottle Gourd', mandi: 'Lauki / Doodhi', category: 'Vegetables', unit: 'kg', icon: '🥒' },
  { name: 'Bitter Gourd', mandi: 'Karela', category: 'Vegetables', unit: 'kg', icon: '🥒' },
  { name: 'Ridge Gourd', mandi: 'Turai', category: 'Vegetables', unit: 'kg', icon: '🥒' },
  { name: 'Sponge Gourd', mandi: 'Gilki', category: 'Vegetables', unit: 'kg', icon: '🥒' },
  { name: 'Snake Gourd', mandi: 'Chichinda', category: 'Vegetables', unit: 'kg', icon: '🥒' },
  { name: 'Pumpkin', mandi: 'Kaddu', category: 'Vegetables', unit: 'kg', icon: '🎃' },
  { name: 'Ash Gourd', mandi: 'Petha', category: 'Vegetables', unit: 'kg', icon: '🍈' },
  { name: 'Radish', mandi: 'Mooli', category: 'Vegetables', unit: 'kg', icon: '🥢' },
  { name: 'Carrot', mandi: 'Gajar', category: 'Vegetables', unit: 'kg', icon: '🥕' },
  { name: 'Desi Red Carrot', mandi: 'Lal Gajar', category: 'Vegetables', unit: 'kg', icon: '🥕' },
  { name: 'Beetroot', mandi: 'Chukandar', category: 'Vegetables', unit: 'kg', icon: '🍠' },
  { name: 'Green Peas', mandi: 'Hari Matar', category: 'Vegetables', unit: 'kg', icon: '🫛' },
  { name: 'Drumstick', mandi: 'Sahjan / Munga', category: 'Vegetables', unit: 'kg', icon: '🌿' },
  { name: 'Raw Banana', mandi: 'Kacha Kela', category: 'Vegetables', unit: 'kg', icon: '🍌' },
  { name: 'Raw Papaya', mandi: 'Kacha Papita', category: 'Vegetables', unit: 'kg', icon: '🥭' },
  { name: 'Lemon', mandi: 'Nimbu', category: 'Vegetables', unit: 'kg', icon: '🍋' },
  { name: 'Taro Root', mandi: 'Arbi / Colocasia', category: 'Vegetables', unit: 'kg', icon: '🥔' },
  { name: 'Elephant Foot Yam', mandi: 'Jimikand / Suran', category: 'Vegetables', unit: 'kg', icon: '🥔' },
  { name: 'Cluster Beans', mandi: 'Gawar Phali', category: 'Vegetables', unit: 'kg', icon: '🫛' },
  { name: 'French Beans', mandi: 'Farasbi', category: 'Vegetables', unit: 'kg', icon: '🫛' },
  { name: 'Flat Beans', mandi: 'Sem Phali', category: 'Vegetables', unit: 'kg', icon: '🫛' },
  { name: 'Sweet Corn', mandi: 'Bhutta', category: 'Vegetables', unit: 'kg', icon: '🌽' },
  { name: 'Button Mushroom', mandi: 'Mushroom', category: 'Vegetables', unit: 'box', icon: '🍄' },
  { name: 'Green Zucchini', mandi: 'Zucchini', category: 'Vegetables', unit: 'kg', icon: '🥒' },
  { name: 'Yellow Zucchini', mandi: 'Zucchini', category: 'Vegetables', unit: 'kg', icon: '🥒' },
  { name: 'Baby Corn', mandi: 'Chota Bhutta', category: 'Vegetables', unit: 'kg', icon: '🌽' },
  { name: 'Pointed Gourd', mandi: 'Parwal', category: 'Vegetables', unit: 'kg', icon: '🥒' },
  { name: 'Ivy Gourd', mandi: 'Kundru / Tendli', category: 'Vegetables', unit: 'kg', icon: '🥒' },
  { name: 'Tinda', mandi: 'Indian Squash', category: 'Vegetables', unit: 'kg', icon: '🍈' },

  // 🍎 FRUITS
  { name: 'Apple', mandi: 'Sev', category: 'Fruits', unit: 'kg', icon: '🍎' },
  { name: 'Royal Delicious Apple', mandi: 'Kashmiri Sev', category: 'Fruits', unit: 'box', icon: '🍎' },
  { name: 'Green Apple', mandi: 'Hara Sev', category: 'Fruits', unit: 'kg', icon: '🍏' },
  { name: 'Banana', mandi: 'Kela', category: 'Fruits', unit: 'box', icon: '🍌' },
  { name: 'Alphonso Mango', mandi: 'Hapus Aam', category: 'Fruits', unit: 'box', icon: '🥭' },
  { name: 'Kesar Mango', mandi: 'Kesar Aam', category: 'Fruits', unit: 'box', icon: '🥭' },
  { name: 'Totapuri Mango', mandi: 'Mango', category: 'Fruits', unit: 'kg', icon: '🥭' },
  { name: 'Dasheri Mango', mandi: 'Aam', category: 'Fruits', unit: 'kg', icon: '🥭' },
  { name: 'Orange', mandi: 'Santra', category: 'Fruits', unit: 'kg', icon: '🍊' },
  { name: 'Sweet Lime', mandi: 'Mosambi', category: 'Fruits', unit: 'kg', icon: '🍊' },
  { name: 'Green Grapes', mandi: 'Angoor', category: 'Fruits', unit: 'kg', icon: '🍇' },
  { name: 'Black Grapes', mandi: 'Kala Angoor', category: 'Fruits', unit: 'kg', icon: '🍇' },
  { name: 'Watermelon', mandi: 'Tarbooz', category: 'Fruits', unit: 'kg', icon: '🍉' },
  { name: 'Muskmelon', mandi: 'Kharbooza', category: 'Fruits', unit: 'kg', icon: '🍈' },
  { name: 'Papaya', mandi: 'Papita', category: 'Fruits', unit: 'kg', icon: '🥭' },
  { name: 'Pomegranate', mandi: 'Anar', category: 'Fruits', unit: 'kg', icon: '🍎' },
  { name: 'Guava', mandi: 'Amrood', category: 'Fruits', unit: 'kg', icon: '🍈' },
  { name: 'Pineapple', mandi: 'Ananas', category: 'Fruits', unit: 'pc', icon: '🍍' },
  { name: 'Custard Apple', mandi: 'Sitaphal', category: 'Fruits', unit: 'kg', icon: '🍈' },
  { name: 'Chikoo', mandi: 'Sapota', category: 'Fruits', unit: 'kg', icon: '🥔' },
  { name: 'Strawberry', mandi: 'Strawberries', category: 'Fruits', unit: 'box', icon: '🍓' },
  { name: 'Dragon Fruit', mandi: 'Kamalam', category: 'Fruits', unit: 'kg', icon: '🐉' },
  { name: 'Kiwi Fruit', mandi: 'Kiwi', category: 'Fruits', unit: 'box', icon: '🥝' },
  { name: 'Coconut', mandi: 'Nariyal', category: 'Fruits', unit: 'pc', icon: '🥥' },
  { name: 'Tender Coconut', mandi: 'Nariyal Paani', category: 'Fruits', unit: 'pc', icon: '🥥' },
  { name: 'Pear', mandi: 'Nashpati', category: 'Fruits', unit: 'kg', icon: '🍐' },
  { name: 'Plum', mandi: 'Aloo Bukhara', category: 'Fruits', unit: 'kg', icon: '🍑' },
  { name: 'Peach', mandi: 'Adoo', category: 'Fruits', unit: 'kg', icon: '🍑' },
  { name: 'Cherry', mandi: 'Cherries', category: 'Fruits', unit: 'box', icon: '🍒' },
  { name: 'Fresh Fig', mandi: 'Anjeer', category: 'Fruits', unit: 'box', icon: '🫐' },
  { name: 'Lychee', mandi: 'Litchi', category: 'Fruits', unit: 'kg', icon: '🍓' },
  { name: 'Jackfruit', mandi: 'Kathal', category: 'Fruits', unit: 'kg', icon: '🍈' },

  // 🥬 LEAFY GREENS
  { name: 'Spinach', mandi: 'Palak', category: 'Leafy', unit: 'bunch', icon: '🥬' },
  { name: 'Coriander', mandi: 'Hara Dhaniya', category: 'Leafy', unit: 'bunch', icon: '🌿' },
  { name: 'Mint Leaves', mandi: 'Pudina', category: 'Leafy', unit: 'bunch', icon: '🌿' },
  { name: 'Fenugreek', mandi: 'Methi', category: 'Leafy', unit: 'bunch', icon: '🌿' },
  { name: 'Spring Onion', mandi: 'Kanda Patta', category: 'Leafy', unit: 'bunch', icon: '🧅' },
  { name: 'Amaranthus', mandi: 'Chaulai Saag', category: 'Leafy', unit: 'bunch', icon: '🥬' },
  { name: 'Mustard Leaves', mandi: 'Sarson Saag', category: 'Leafy', unit: 'bunch', icon: '🥬' },
  { name: 'Curry Leaves', mandi: 'Kadi Patta', category: 'Leafy', unit: 'bunch', icon: '🌿' },
  { name: 'Dill Leaves', mandi: 'Suva / Shepu', category: 'Leafy', unit: 'bunch', icon: '🌿' },
  { name: 'Iceberg Lettuce', mandi: 'Lettuce', category: 'Leafy', unit: 'kg', icon: '🥬' },
  { name: 'Romaine Lettuce', mandi: 'Lettuce', category: 'Leafy', unit: 'kg', icon: '🥬' },
  { name: 'Parsley', mandi: 'Parsley Leaves', category: 'Leafy', unit: 'bunch', icon: '🌿' },
  { name: 'Basil Leaves', mandi: 'Tulsi / Italian Basil', category: 'Leafy', unit: 'bunch', icon: '🌿' },
  { name: 'Kale', mandi: 'Green Kale', category: 'Leafy', unit: 'bunch', icon: '🥬' }
];

// Helper to attach produce autocomplete to an input field
function initProduceAutocomplete(inputEl, categoryEl, unitEl) {
  if (!inputEl) return;

  // Create wrapper & dropdown container if not present
  let wrapper = inputEl.closest('.produce-autocomplete-wrapper');
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.className = 'produce-autocomplete-wrapper';
    inputEl.parentNode.insertBefore(wrapper, inputEl);
    wrapper.appendChild(inputEl);
  }

  let dropdown = wrapper.querySelector('.produce-autocomplete-dropdown');
  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.className = 'produce-autocomplete-dropdown';
    wrapper.appendChild(dropdown);
  }

  // Also create HTML5 datalist fallback for native keyboard suggestions
  let datalist = document.getElementById('produceDatalist');
  if (!datalist) {
    datalist = document.createElement('datalist');
    datalist.id = 'produceDatalist';
    PRODUCE_DICTIONARY.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.name;
      opt.label = `${item.name} (${item.mandi}) - ${item.category}`;
      datalist.appendChild(opt);
    });
    document.body.appendChild(datalist);
  }
  inputEl.setAttribute('list', 'produceDatalist');

  function filterProduce(q) {
    const query = String(q || '').trim().toLowerCase();
    if (!query) return [];

    // Filter items matching name, mandi name, or category
    const matches = PRODUCE_DICTIONARY.filter(item => {
      const n = item.name.toLowerCase();
      const m = item.mandi.toLowerCase();
      const c = item.category.toLowerCase();
      return n.includes(query) || m.includes(query) || c.includes(query);
    });

    // Rank items starting with query first
    matches.sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(query) || a.mandi.toLowerCase().startsWith(query);
      const bStarts = b.name.toLowerCase().startsWith(query) || b.mandi.toLowerCase().startsWith(query);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.name.localeCompare(b.name);
    });

    return matches.slice(0, 10);
  }

  function renderDropdown(items) {
    if (!items || !items.length) {
      dropdown.classList.remove('show');
      dropdown.innerHTML = '';
      return;
    }

    dropdown.innerHTML = items.map((item, idx) => `
      <div class="produce-autocomplete-item" data-idx="${idx}">
        <div class="produce-item-left">
          <span style="font-size:1.1rem;line-height:1;">${item.icon}</span>
          <div>
            <span class="produce-item-name">${esc(item.name)}</span>
            <span class="produce-item-mandi">(${esc(item.mandi)})</span>
          </div>
        </div>
        <div style="display:flex;gap:0.4rem;align-items:center;">
          <span class="produce-item-tag">${esc(item.category)}</span>
          <span style="font-size:0.75rem;color:#64748b;">${esc(item.unit)}</span>
        </div>
      </div>
    `).join('');

    dropdown.classList.add('show');

    // Attach click listeners to items
    dropdown.querySelectorAll('.produce-autocomplete-item').forEach((row, i) => {
      row.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        selectItem(items[i]);
      });
    });
  }

  function selectItem(item) {
    inputEl.value = item.name;
    if (categoryEl && item.category) {
      categoryEl.value = item.category;
      categoryEl.dispatchEvent(new Event('change'));
    }
    if (unitEl && item.unit) {
      unitEl.value = item.unit;
      unitEl.dispatchEvent(new Event('change'));
    }
    inputEl.dispatchEvent(new Event('input'));
    dropdown.classList.remove('show');
  }

  inputEl.addEventListener('input', () => {
    const matches = filterProduce(inputEl.value);
    renderDropdown(matches);
  });

  inputEl.addEventListener('focus', () => {
    if (inputEl.value.trim()) {
      const matches = filterProduce(inputEl.value);
      renderDropdown(matches);
    }
  });

  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      dropdown.classList.remove('show');
    }
  });
}


// ── Formatting ───────────────────────────────────────────────────
function formatDate(d) {
  try {
    return new Date(d).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch (e) { return d; }
}

function money(n) {
  const v = Number(n || 0);
  return '₹' + v.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// ── XSS-safe HTML escaping ────────────────────────────────────────
function esc(s) {
  return String(s === undefined || s === null ? '' : s)
    .replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

// ── Toast notifications ───────────────────────────────────────────
function toast(msg, type) {
  let box = document.getElementById('toastBox');
  if (!box) {
    box = document.createElement('div');
    box.id = 'toastBox';
    box.className = 'toasts';
    document.body.appendChild(box);
  }
  const t = document.createElement('div');
  t.className = 'toast ' + (type || 'success');
  t.textContent = msg;
  box.appendChild(t);
  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => t.classList.add('show'));
  });
  // Animate out and remove
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 350);
  }, 3500);
}

// ── Fetch API wrapper (auto-attaches auth token) ─────────────────
async function api(path, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...(options.headers || {})
    }
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // Server returned HTML (502 / deploying / crash) — show friendly message
    throw new Error('⚠️ Server is starting up or temporarily unavailable. Please refresh in 30 seconds.');
  }
  if (!res.ok) throw new Error((data && data.error) || 'Request failed: ' + res.status);
  return data;
}

// ── Bulk tier price lookup ─────────────────────────────────────────
function unitPrice(p, qty) {
  const q = Number(qty || 0);
  let price = Number(p.price || 0);
  (p.bulkTiers || []).forEach(t => {
    if (q >= Number(t.minQty || 0) && Number(t.price) > 0) price = Number(t.price);
  });
  return price;
}

// ── CSV download helper ──────────────────────────────────────────
function downloadCSV(filename, rows) {
  const csv = rows.map(r =>
    r.map(v => '"' + String(v === null || v === undefined ? '' : v).replace(/"/g, '""') + '"').join(',')
  ).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

// ── Draggable WhatsApp Floating Button ──────────────────────────────
function initDraggableWhatsApp() {
  const el = document.querySelector('.whatsapp-float');
  if (!el) return;

  let isDragging = false;
  let dragStarted = false;
  let startX = 0, startY = 0;
  let initialLeft = 0, initialTop = 0;

  const onStart = (e) => {
    dragStarted = false;
    isDragging = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const rect = el.getBoundingClientRect();
    startX = clientX;
    startY = clientY;
    initialLeft = rect.left;
    initialTop = rect.top;

    el.style.bottom = 'auto';
    el.style.right = 'auto';
    el.style.left = initialLeft + 'px';
    el.style.top = initialTop + 'px';
    el.style.transition = 'none';
    el.style.cursor = 'grabbing';
  };

  const onMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const dx = clientX - startX;
    const dy = clientY - startY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragStarted = true;
    }

    if (dragStarted) {
      if (e.cancelable) e.preventDefault();
      let newLeft = initialLeft + dx;
      let newTop = initialTop + dy;

      const maxLeft = window.innerWidth - el.offsetWidth - 8;
      const maxTop = window.innerHeight - el.offsetHeight - 8;
      newLeft = Math.max(8, Math.min(newLeft, maxLeft));
      newTop = Math.max(8, Math.min(newTop, maxTop));

      el.style.left = newLeft + 'px';
      el.style.top = newTop + 'px';
    }
  };

  const onEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    el.style.cursor = 'grab';
    el.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';

    if (dragStarted) {
      const clickPreventer = (clickEvt) => {
        clickEvt.preventDefault();
        clickEvt.stopPropagation();
        el.removeEventListener('click', clickPreventer, true);
      };
      el.addEventListener('click', clickPreventer, true);
    }
  };

  el.style.cursor = 'grab';
  el.style.touchAction = 'none';
  el.style.userSelect = 'none';

  el.addEventListener('mousedown', onStart);
  window.addEventListener('mousemove', onMove, { passive: false });
  window.addEventListener('mouseup', onEnd);

  el.addEventListener('touchstart', onStart, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('touchend', onEnd);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDraggableWhatsApp);
} else {
  initDraggableWhatsApp();
}
