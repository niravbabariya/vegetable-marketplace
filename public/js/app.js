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

// Auto close mobile nav on link click or outside click
document.addEventListener('click', (e) => {
  const navbar = document.querySelector('.navbar');
  if (!navbar || !navbar.classList.contains('nav-open')) return;
  if (!navbar.contains(e.target)) {
    navbar.classList.remove('nav-open');
    const toggleBtn = document.querySelector('.nav-toggle');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.innerHTML = '☰';
    }
  }
});


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
