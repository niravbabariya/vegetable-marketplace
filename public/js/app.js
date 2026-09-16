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
// ── Comprehensive Produce Dictionary (Vegetables, Fruits, Leafy) ─────
const PRODUCE_DICTIONARY = [
  // 🥦 VEGETABLES
  { name: 'Fresh Tomatoes', mandi: 'Tamatar · ટામેટાં', category: 'Vegetables', unit: 'kg', icon: '🍅' },
  { name: 'Cherry Tomatoes', mandi: 'Small Tamatar · ચેરી ટામેટાં', category: 'Vegetables', unit: 'kg', icon: '🍅' },
  { name: 'Vine Tomatoes', mandi: 'Desi Tamatar · દેશી ટામેટાં', category: 'Vegetables', unit: 'kg', icon: '🍅' },
  { name: 'Potatoes', mandi: 'Batata / Aloo · બટાકા', category: 'Vegetables', unit: 'kg', icon: '🥔' },
  { name: 'Baby Potatoes', mandi: 'Chota Aloo · બેબી બટાકા', category: 'Vegetables', unit: 'kg', icon: '🥔' },
  { name: 'Sweet Potato', mandi: 'Shakarkand · શક્કરિયાં', category: 'Vegetables', unit: 'kg', icon: '🍠' },
  { name: 'Red Onion', mandi: 'Lal Pyaz / Kanda · ડુંગળી', category: 'Vegetables', unit: 'kg', icon: '🧅' },
  { name: 'White Onion', mandi: 'Safed Pyaz · સફેદ ડુંગળી', category: 'Vegetables', unit: 'kg', icon: '🧅' },
  { name: 'Garlic', mandi: 'Lahsun · લસણ', category: 'Vegetables', unit: 'kg', icon: '🧄' },
  { name: 'Peeled Garlic', mandi: 'Chhila Lahsun · ફોલેલું લસણ', category: 'Vegetables', unit: 'kg', icon: '🧄' },
  { name: 'Ginger', mandi: 'Adrak · આદુ', category: 'Vegetables', unit: 'kg', icon: '🫚' },
  { name: 'Green Chili', mandi: 'Hari Mirch · લીલા મરચાં', category: 'Vegetables', unit: 'kg', icon: '🌶️' },
  { name: 'Red Chili', mandi: 'Lal Mirch · લાલ મરચાં', category: 'Vegetables', unit: 'kg', icon: '🌶️' },
  { name: 'Capsicum / Green Bell Pepper', mandi: 'Shimla Mirch · કેપ્સિકમ', category: 'Vegetables', unit: 'kg', icon: '🫑' },
  { name: 'Red Bell Pepper', mandi: 'Lal Shimla Mirch · લાલ કેપ્સિકમ', category: 'Vegetables', unit: 'kg', icon: '🫑' },
  { name: 'Yellow Bell Pepper', mandi: 'Pili Shimla Mirch · પીળું કેપ્સિકમ', category: 'Vegetables', unit: 'kg', icon: '🫑' },
  { name: 'Cucumber', mandi: 'Kheera / Kakdi · કાકડી', category: 'Vegetables', unit: 'kg', icon: '🥒' },
  { name: 'English Cucumber', mandi: 'Green Cucumber · કાકડી', category: 'Vegetables', unit: 'kg', icon: '🥒' },
  { name: 'Cauliflower', mandi: 'Phool Gobhi · ફુલાવર', category: 'Vegetables', unit: 'kg', icon: '🥦' },
  { name: 'Cabbage', mandi: 'Patta Gobhi · કોબીજ', category: 'Vegetables', unit: 'kg', icon: '🥬' },
  { name: 'Purple Cabbage', mandi: 'Lal Patta Gobhi · લાલ કોબીજ', category: 'Vegetables', unit: 'kg', icon: '🥬' },
  { name: 'Broccoli', mandi: 'Hari Gobhi · બ્રોકોલી', category: 'Vegetables', unit: 'kg', icon: '🥦' },
  { name: 'Brinjal / Eggplant', mandi: 'Baingan · રીંગણ / રવૈયા', category: 'Vegetables', unit: 'kg', icon: '🍆' },
  { name: 'Small Baingan', mandi: 'Bharta Baingan · નાના રીંગણ', category: 'Vegetables', unit: 'kg', icon: '🍆' },
  { name: 'Bhindi / Okra', mandi: 'Lady Finger · ભીંડા', category: 'Vegetables', unit: 'kg', icon: '🫛' },
  { name: 'Bottle Gourd', mandi: 'Lauki / Doodhi · દૂધી', category: 'Vegetables', unit: 'kg', icon: '🥒' },
  { name: 'Bitter Gourd', mandi: 'Karela · કારેલાં', category: 'Vegetables', unit: 'kg', icon: '🥒' },
  { name: 'Ridge Gourd', mandi: 'Turai · તુરિયાં', category: 'Vegetables', unit: 'kg', icon: '🥒' },
  { name: 'Sponge Gourd', mandi: 'Gilki · ગિલકી', category: 'Vegetables', unit: 'kg', icon: '🥒' },
  { name: 'Snake Gourd', mandi: 'Chichinda · ચીચીંડા', category: 'Vegetables', unit: 'kg', icon: '🥒' },
  { name: 'Pumpkin', mandi: 'Kaddu · કોળું', category: 'Vegetables', unit: 'kg', icon: '🎃' },
  { name: 'Ash Gourd', mandi: 'Petha · સફેદ કોળું', category: 'Vegetables', unit: 'kg', icon: '🍈' },
  { name: 'Radish', mandi: 'Mooli · મૂળો', category: 'Vegetables', unit: 'kg', icon: '🥢' },
  { name: 'Carrot', mandi: 'Gajar · ગાજર', category: 'Vegetables', unit: 'kg', icon: '🥕' },
  { name: 'Desi Red Carrot', mandi: 'Lal Gajar · લાલ ગાજર', category: 'Vegetables', unit: 'kg', icon: '🥕' },
  { name: 'Beetroot', mandi: 'Chukandar · બીટ', category: 'Vegetables', unit: 'kg', icon: '🍠' },
  { name: 'Green Peas', mandi: 'Hari Matar · લીલા વટાણા', category: 'Vegetables', unit: 'kg', icon: '🫛' },
  { name: 'Drumstick', mandi: 'Sahjan / Munga · સરગવો', category: 'Vegetables', unit: 'kg', icon: '🌿' },
  { name: 'Raw Banana', mandi: 'Kacha Kela · કાચા કેળાં', category: 'Vegetables', unit: 'kg', icon: '🍌' },
  { name: 'Raw Papaya', mandi: 'Kacha Papita · કાચી પપૈયા', category: 'Vegetables', unit: 'kg', icon: '🥭' },
  { name: 'Lemon', mandi: 'Nimbu · લીંબુ', category: 'Vegetables', unit: 'kg', icon: '🍋' },
  { name: 'Taro Root', mandi: 'Arbi / Colocasia · અળવી', category: 'Vegetables', unit: 'kg', icon: '🥔' },
  { name: 'Elephant Foot Yam', mandi: 'Jimikand / Suran · સુરણ', category: 'Vegetables', unit: 'kg', icon: '🥔' },
  { name: 'Cluster Beans', mandi: 'Gawar Phali · ગુવાર', category: 'Vegetables', unit: 'kg', icon: '🫛' },
  { name: 'French Beans', mandi: 'Farasbi · ફણસી', category: 'Vegetables', unit: 'kg', icon: '🫛' },
  { name: 'Flat Beans', mandi: 'Sem Phali · વાલોળ / ચોળી', category: 'Vegetables', unit: 'kg', icon: '🫛' },
  { name: 'Sweet Corn', mandi: 'Bhutta · મકાઈ', category: 'Vegetables', unit: 'kg', icon: '🌽' },
  { name: 'Button Mushroom', mandi: 'Mushroom · મશરૂમ', category: 'Vegetables', unit: 'box', icon: '🍄' },
  { name: 'Green Zucchini', mandi: 'Zucchini · ઝુકીની', category: 'Vegetables', unit: 'kg', icon: '🥒' },
  { name: 'Yellow Zucchini', mandi: 'Zucchini · પીળી ઝુકીની', category: 'Vegetables', unit: 'kg', icon: '🥒' },
  { name: 'Baby Corn', mandi: 'Chota Bhutta · બેબી કોર્ન', category: 'Vegetables', unit: 'kg', icon: '🌽' },
  { name: 'Pointed Gourd', mandi: 'Parwal · પરવળ', category: 'Vegetables', unit: 'kg', icon: '🥒' },
  { name: 'Ivy Gourd', mandi: 'Kundru / Tendli · ટીંડોળા', category: 'Vegetables', unit: 'kg', icon: '🥒' },
  { name: 'Tinda', mandi: 'Indian Squash · ટીંડા', category: 'Vegetables', unit: 'kg', icon: '🍈' },

  // 🍎 FRUITS
  { name: 'Apple', mandi: 'Sev · સફરજન', category: 'Fruits', unit: 'kg', icon: '🍎' },
  { name: 'Royal Delicious Apple', mandi: 'Kashmiri Sev · કાશ્મીરી સફરજન', category: 'Fruits', unit: 'box', icon: '🍎' },
  { name: 'Green Apple', mandi: 'Hara Sev · લીલું સફરજન', category: 'Fruits', unit: 'kg', icon: '🍏' },
  { name: 'Banana', mandi: 'Kela · કેળાં', category: 'Fruits', unit: 'box', icon: '🍌' },
  { name: 'Alphonso Mango', mandi: 'Hapus Aam · હાફૂસ કેરી', category: 'Fruits', unit: 'box', icon: '🥭' },
  { name: 'Kesar Mango', mandi: 'Kesar Aam · કેસર કેરી', category: 'Fruits', unit: 'box', icon: '🥭' },
  { name: 'Totapuri Mango', mandi: 'Mango · તોતાપુરી કેરી', category: 'Fruits', unit: 'kg', icon: '🥭' },
  { name: 'Dasheri Mango', mandi: 'Aam · દશેરી કેરી', category: 'Fruits', unit: 'kg', icon: '🥭' },
  { name: 'Orange', mandi: 'Santra · સંતરાં / નારંગી', category: 'Fruits', unit: 'kg', icon: '🍊' },
  { name: 'Sweet Lime', mandi: 'Mosambi · મોસંબી', category: 'Fruits', unit: 'kg', icon: '🍊' },
  { name: 'Green Grapes', mandi: 'Angoor · લીલી દ્રાક્ષ', category: 'Fruits', unit: 'kg', icon: '🍇' },
  { name: 'Black Grapes', mandi: 'Kala Angoor · કાળી દ્રાક્ષ', category: 'Fruits', unit: 'kg', icon: '🍇' },
  { name: 'Watermelon', mandi: 'Tarbooz · તરબૂચ', category: 'Fruits', unit: 'kg', icon: '🍉' },
  { name: 'Muskmelon', mandi: 'Kharbooza · શક્કરટેટી', category: 'Fruits', unit: 'kg', icon: '🍈' },
  { name: 'Papaya', mandi: 'Papita · પપૈયું', category: 'Fruits', unit: 'kg', icon: '🥭' },
  { name: 'Pomegranate', mandi: 'Anar · દાડમ', category: 'Fruits', unit: 'kg', icon: '🍎' },
  { name: 'Guava', mandi: 'Amrood · જામફળ', category: 'Fruits', unit: 'kg', icon: '🍈' },
  { name: 'Pineapple', mandi: 'Ananas · અનેનાસ', category: 'Fruits', unit: 'pc', icon: '🍍' },
  { name: 'Custard Apple', mandi: 'Sitaphal · સીતાફળ', category: 'Fruits', unit: 'kg', icon: '🍈' },
  { name: 'Chikoo', mandi: 'Sapota · ચીકુ', category: 'Fruits', unit: 'kg', icon: '🥔' },
  { name: 'Strawberry', mandi: 'Strawberries · સ્ટ્રોબેરી', category: 'Fruits', unit: 'box', icon: '🍓' },
  { name: 'Dragon Fruit', mandi: 'Kamalam · કમલમ', category: 'Fruits', unit: 'kg', icon: '🐉' },
  { name: 'Kiwi Fruit', mandi: 'Kiwi · કીવી', category: 'Fruits', unit: 'box', icon: '🥝' },
  { name: 'Coconut', mandi: 'Nariyal · નાળિયેર', category: 'Fruits', unit: 'pc', icon: '🥥' },
  { name: 'Tender Coconut', mandi: 'Nariyal Paani · ત્રોફા', category: 'Fruits', unit: 'pc', icon: '🥥' },
  { name: 'Pear', mandi: 'Nashpati · નાસપાતી', category: 'Fruits', unit: 'kg', icon: '🍐' },
  { name: 'Plum', mandi: 'Aloo Bukhara · આલુ બુખારા', category: 'Fruits', unit: 'kg', icon: '🍑' },
  { name: 'Peach', mandi: 'Adoo · આડુ', category: 'Fruits', unit: 'kg', icon: '🍑' },
  { name: 'Cherry', mandi: 'Cherries · ચેરી', category: 'Fruits', unit: 'box', icon: '🍒' },
  { name: 'Fresh Fig', mandi: 'Anjeer · અંજીર', category: 'Fruits', unit: 'box', icon: '🫐' },
  { name: 'Lychee', mandi: 'Litchi · લીચી', category: 'Fruits', unit: 'kg', icon: '🍓' },
  { name: 'Jackfruit', mandi: 'Kathal · ફણસ', category: 'Fruits', unit: 'kg', icon: '🍈' },

  // 🥬 LEAFY GREENS
  { name: 'Spinach', mandi: 'Palak · પાલક', category: 'Leafy', unit: 'bunch', icon: '🥬' },
  { name: 'Coriander', mandi: 'Hara Dhaniya · કોથમીર', category: 'Leafy', unit: 'bunch', icon: '🌿' },
  { name: 'Mint Leaves', mandi: 'Pudina · ફુદીનો', category: 'Leafy', unit: 'bunch', icon: '🌿' },
  { name: 'Fenugreek', mandi: 'Methi · મેથી', category: 'Leafy', unit: 'bunch', icon: '🌿' },
  { name: 'Spring Onion', mandi: 'Kanda Patta · લીલી ડુંગળી', category: 'Leafy', unit: 'bunch', icon: '🧅' },
  { name: 'Amaranthus', mandi: 'Chaulai Saag · તાંદળજો', category: 'Leafy', unit: 'bunch', icon: '🥬' },
  { name: 'Mustard Leaves', mandi: 'Sarson Saag · સરસવની ભાજી', category: 'Leafy', unit: 'bunch', icon: '🥬' },
  { name: 'Curry Leaves', mandi: 'Kadi Patta · મીઠો લીમડો', category: 'Leafy', unit: 'bunch', icon: '🌿' },
  { name: 'Dill Leaves', mandi: 'Suva / Shepu · સુવા ભાજી', category: 'Leafy', unit: 'bunch', icon: '🌿' },
  { name: 'Iceberg Lettuce', mandi: 'Lettuce · સલાડ પત્તા', category: 'Leafy', unit: 'kg', icon: '🥬' },
  { name: 'Romaine Lettuce', mandi: 'Lettuce · સલાડ પત્તા', category: 'Leafy', unit: 'kg', icon: '🥬' },
  { name: 'Parsley', mandi: 'Parsley Leaves · પાર્સલી', category: 'Leafy', unit: 'bunch', icon: '🌿' },
  { name: 'Basil Leaves', mandi: 'Tulsi / Italian Basil · તુલસી / બેસિલ', category: 'Leafy', unit: 'bunch', icon: '🌿' },
  { name: 'Kale', mandi: 'Green Kale · કેલ ભાજી', category: 'Leafy', unit: 'bunch', icon: '🥬' }
];

// Helper to attach premium produce autocomplete to an input field
function initProduceAutocomplete(inputEl, categoryEl, unitEl) {
  if (!inputEl) return;

  // IMPORTANT: Remove any native browser datalist & disable OS autofill popup
  inputEl.removeAttribute('list');
  inputEl.setAttribute('autocomplete', 'off');
  inputEl.setAttribute('spellcheck', 'false');
  inputEl.classList.add('produce-input-field');

  const oldDatalist = document.getElementById('produceDatalist');
  if (oldDatalist) oldDatalist.remove();

  // Create wrapper & dropdown container
  let wrapper = inputEl.closest('.produce-autocomplete-wrapper');
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.className = 'produce-autocomplete-wrapper';
    inputEl.parentNode.insertBefore(wrapper, inputEl);
    wrapper.appendChild(inputEl);
  }

  // Add produce icon on left
  let iconEl = wrapper.querySelector('.produce-input-icon');
  if (!iconEl) {
    iconEl = document.createElement('span');
    iconEl.className = 'produce-input-icon';
    iconEl.innerHTML = '🥬';
    wrapper.appendChild(iconEl);
  }

  // Add clear button on right
  let clearBtn = wrapper.querySelector('.produce-clear-btn');
  if (!clearBtn) {
    clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'produce-clear-btn';
    clearBtn.innerHTML = '✕';
    clearBtn.title = 'Clear input';
    wrapper.appendChild(clearBtn);

    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      inputEl.value = '';
      iconEl.innerHTML = '🥬';
      clearBtn.classList.remove('visible');
      inputEl.focus();
      const matches = filterProduce('');
      renderDropdown(matches, '');
    });
  }

  let dropdown = wrapper.querySelector('.produce-autocomplete-dropdown');
  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.className = 'produce-autocomplete-dropdown';
    wrapper.appendChild(dropdown);
  }

  let activeCategoryFilter = 'All';
  let activeIndex = -1;
  let currentMatches = [];

  function updateClearBtn() {
    if (inputEl.value && inputEl.value.trim().length > 0) {
      clearBtn.classList.add('visible');
    } else {
      clearBtn.classList.remove('visible');
    }
  }

  function filterProduce(q) {
    const query = String(q || '').trim().toLowerCase();

    let list = PRODUCE_DICTIONARY;
    if (activeCategoryFilter !== 'All') {
      list = list.filter(item => item.category === activeCategoryFilter);
    }

    if (!query) {
      // Return top popular produce when query is empty
      return list.slice(0, 8);
    }

    // Filter items matching name, mandi name, or category
    const matches = list.filter(item => {
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

  function highlightMatch(text, q) {
    if (!q) return esc(text);
    const escapedQ = q.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const regex = new RegExp(`(${escapedQ})`, 'gi');
    return esc(text).replace(regex, '<span class="produce-highlight">$1</span>');
  }

  function renderDropdown(items, query) {
    currentMatches = items;
    activeIndex = -1;

    const q = String(query || '').trim();

    if (!items || !items.length) {
      dropdown.innerHTML = `
        <div class="produce-tabs-header">
          <div class="produce-tabs-title">
            <span class="produce-sparkle">✨</span>
            <span>Quick Select</span>
          </div>
          <div class="produce-tabs-chips">
            <button type="button" class="produce-tab-chip ${activeCategoryFilter === 'All' ? 'active' : ''}" data-cat="All">All</button>
            <button type="button" class="produce-tab-chip ${activeCategoryFilter === 'Vegetables' ? 'active' : ''}" data-cat="Vegetables">🥦 Veg</button>
            <button type="button" class="produce-tab-chip ${activeCategoryFilter === 'Fruits' ? 'active' : ''}" data-cat="Fruits">🍎 Fruits</button>
            <button type="button" class="produce-tab-chip ${activeCategoryFilter === 'Leafy' ? 'active' : ''}" data-cat="Leafy">🥬 Leafy</button>
          </div>
        </div>
        <div style="padding:1.4rem 1rem;text-align:center;color:#64748b;font-size:0.9rem;">
          🔍 No standard mandi produce found for "<strong>${esc(query)}</strong>".<br>
          <span style="font-size:0.8rem;color:#94a3b8;margin-top:0.3rem;display:inline-block;">
            ✨ You can still keep this custom name! Just pick your Category and Unit below.
          </span>
        </div>
      `;
      dropdown.classList.add('show');
      bindTabClicks();
      return;
    }

    dropdown.innerHTML = `
      <div class="produce-tabs-header">
        <div class="produce-tabs-title">
          <span class="produce-sparkle">✨</span>
          <span>${q ? 'Matching Produce' : 'Popular Mandi Produce'}</span>
        </div>
        <div class="produce-tabs-chips">
          <button type="button" class="produce-tab-chip ${activeCategoryFilter === 'All' ? 'active' : ''}" data-cat="All">All</button>
          <button type="button" class="produce-tab-chip ${activeCategoryFilter === 'Vegetables' ? 'active' : ''}" data-cat="Vegetables">🥦 Veg</button>
          <button type="button" class="produce-tab-chip ${activeCategoryFilter === 'Fruits' ? 'active' : ''}" data-cat="Fruits">🍎 Fruits</button>
          <button type="button" class="produce-tab-chip ${activeCategoryFilter === 'Leafy' ? 'active' : ''}" data-cat="Leafy">🥬 Leafy</button>
        </div>
      </div>
      <div class="produce-items-container">
        ${items.map((item, idx) => {
          let iconClass = 'produce-icon-veg';
          let tagClass = 'tag-veg';
          if (item.category === 'Fruits') { iconClass = 'produce-icon-fruit'; tagClass = 'tag-fruit'; }
          if (item.category === 'Leafy')  { iconClass = 'produce-icon-leafy'; tagClass = 'tag-leafy'; }

          return `
            <div class="produce-autocomplete-item" data-idx="${idx}">
              <div class="produce-item-left">
                <div class="produce-icon-box ${iconClass}">${item.icon}</div>
                <div class="produce-item-info">
                  <span class="produce-item-name">${highlightMatch(item.name, q)}</span>
                  <div class="produce-item-mandi">
                    <span>📍</span>
                    <span>${highlightMatch(item.mandi, q)}</span>
                  </div>
                </div>
              </div>
              <div class="produce-item-right">
                <span class="produce-unit-pill">📦 Per ${esc(item.unit)}</span>
                <span class="produce-item-tag ${tagClass}">${esc(item.category)}</span>
                <span class="produce-hover-action">Select ↵</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      <div class="produce-autocomplete-footer">
        <div class="produce-footer-keys">
          <span class="produce-key-badge">↑</span>
          <span class="produce-key-badge">↓</span>
          <span>navigate</span>
          <span class="produce-key-badge">↵</span>
          <span>select</span>
          <span class="produce-key-badge">esc</span>
          <span>close</span>
        </div>
        <div class="produce-footer-status">
          <span class="produce-auto-badge">⚡ Auto-fills category & unit</span>
        </div>
      </div>
    `;

    dropdown.classList.add('show');
    bindTabClicks();

    // Attach click listeners to items
    dropdown.querySelectorAll('.produce-autocomplete-item').forEach((row, i) => {
      row.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Prevent input blur before click finishes
        selectItem(items[i]);
      });
    });
  }

  function bindTabClicks() {
    dropdown.querySelectorAll('.produce-tab-chip').forEach(btn => {
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        activeCategoryFilter = btn.getAttribute('data-cat') || 'All';
        const matches = filterProduce(inputEl.value);
        renderDropdown(matches, inputEl.value);
      });
    });
  }

  function selectItem(item) {
    if (!item) return;
    inputEl.value = item.name;
    iconEl.innerHTML = item.icon || '🥬';
    updateClearBtn();

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
    activeIndex = -1;

    // Auto-focus the next field (e.g. price) for super fast seller experience
    const priceField = document.getElementById('pPrice');
    if (priceField) {
      setTimeout(() => priceField.focus(), 50);
    }
  }

  // Input Events
  inputEl.addEventListener('input', () => {
    updateClearBtn();
    const matches = filterProduce(inputEl.value);
    renderDropdown(matches, inputEl.value);
  });

  inputEl.addEventListener('focus', () => {
    updateClearBtn();
    const matches = filterProduce(inputEl.value);
    renderDropdown(matches, inputEl.value);
  });

  // Keyboard Navigation: ArrowDown, ArrowUp, Enter, Escape
  inputEl.addEventListener('keydown', (e) => {
    if (!dropdown.classList.contains('show') || !currentMatches.length) return;

    const rows = dropdown.querySelectorAll('.produce-autocomplete-item');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % currentMatches.length;
      updateActiveRow(rows);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + currentMatches.length) % currentMatches.length;
      updateActiveRow(rows);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < currentMatches.length) {
        e.preventDefault();
        selectItem(currentMatches[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      dropdown.classList.remove('show');
    }
  });

  function updateActiveRow(rows) {
    rows.forEach((r, i) => {
      if (i === activeIndex) {
        r.classList.add('active');
        r.scrollIntoView({ block: 'nearest' });
      } else {
        r.classList.remove('active');
      }
    });
  }

  // Close on outside click
  document.addEventListener('mousedown', (e) => {
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
