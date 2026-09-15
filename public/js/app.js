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
  let data = null;
  try { data = await res.json(); } catch { data = null; }
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
