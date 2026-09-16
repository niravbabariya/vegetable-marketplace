'use strict';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── SECURITY: Secrets from environment only ──────────────────────
// JWT secret: must be set in .env — never falls back to a weak default
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('[FATAL] JWT_SECRET not set or too short in .env — server will not start.');
  process.exit(1);
}

// AES-256-GCM data encryption key (for encrypting sensitive fields at rest)
const DATA_ENC_KEY_HEX = process.env.DATA_ENCRYPTION_KEY;
if (!DATA_ENC_KEY_HEX || DATA_ENC_KEY_HEX.length !== 64) {
  console.error('[FATAL] DATA_ENCRYPTION_KEY must be a 64-char hex string (32 bytes) in .env — server will not start.');
  process.exit(1);
}
const DATA_ENC_KEY = Buffer.from(DATA_ENC_KEY_HEX, 'hex');

// ── AES-256-GCM field encryption/decryption helpers ─────────────
const FIELD_ENC_PREFIX = 'ENC:';

function encryptField(plaintext) {
  if (!plaintext || typeof plaintext !== 'string') return plaintext;
  if (plaintext.startsWith(FIELD_ENC_PREFIX)) return plaintext; // already encrypted
  const iv = crypto.randomBytes(12); // 96-bit nonce for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', DATA_ENC_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Format: ENC:<iv_hex>:<tag_hex>:<ciphertext_hex>
  return FIELD_ENC_PREFIX + iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptField(ciphertext) {
  if (!ciphertext || typeof ciphertext !== 'string') return ciphertext;
  if (!ciphertext.startsWith(FIELD_ENC_PREFIX)) return ciphertext; // legacy plaintext
  try {
    const parts = ciphertext.slice(FIELD_ENC_PREFIX.length).split(':');
    if (parts.length !== 3) return '[encrypted]';
    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encryptedData = Buffer.from(parts[2], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', DATA_ENC_KEY, iv);
    decipher.setAuthTag(tag);
    return decipher.update(encryptedData) + decipher.final('utf8');
  } catch {
    return '[encrypted]';
  }
}

// ── Generate cryptographically strong user IDs ───────────────────
function generateUserId() {
  // 128-bit random → 32 hex chars, prefixed for clarity
  return 'u_' + crypto.randomBytes(16).toString('hex');
}

// ── Role-based safe user serialisers ────────────────────────────
// NEVER include password hash in any response
// Only admin can see other users' internal ID

function safeUserForAdmin(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: decryptField(u.phone) || '',
    address: decryptField(u.address) || '',
    shopName: u.shopName || '',
    role: u.role,
    createdAt: u.createdAt
    // password: NEVER included
  };
}

function safeUserForSelf(u) {
  return {
    id: u.id,          // user may know their own ID (it's in their JWT anyway)
    name: u.name,
    email: u.email,
    phone: decryptField(u.phone) || '',
    address: decryptField(u.address) || '',
    shopName: u.shopName || '',
    role: u.role
    // password: NEVER included
  };
}

// For embedding in public product listings — no PII
function safeRetailerPublic(u) {
  return {
    retailerName: u ? u.name : 'Verified Retailer',
    shopName: u ? (u.shopName || u.name + "'s Store") : 'Fresh Produce Mandi',
    retailerLocation: u ? decryptField(u.address || u.location || 'Local Mandi') : 'Local Mandi',
    retailerPhone: u ? decryptField(u.phone) : ''
    // id: NOT included in public product listings
  };
}

// ── Security Headers ─────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'"
  );
  next();
});

// ── CORS: allow same-origin + configurable via env ──────────────
// In production (Render/Vercel), the API and frontend are served
// from the same Express server, so CORS headers are only needed
// for cross-origin callers. We allow the configured origin + localhost.
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || ''; // e.g. https://vegetable-marketplace.onrender.com

app.use(cors({
  origin: (origin, cb) => {
    // Same-origin / no-origin (server-to-server / curl) always allowed
    if (!origin) return cb(null, true);
    // Explicitly configured origin
    if (ALLOWED_ORIGIN && origin === ALLOWED_ORIGIN) return cb(null, true);
    // Any localhost (dev)
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null, true);
    // Any *.onrender.com subdomain (Render hosting)
    if (/^https:\/\/[a-zA-Z0-9-]+\.onrender\.com$/.test(origin)) return cb(null, true);
    // Block everything else
    cb(new Error('CORS: origin not allowed'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '512kb' }));
app.use(express.static('public'));

app.set('trust proxy', 1);

// ── IP Rate Limiter ──────────────────────────────────────────────
const rateLimitMap = new Map();
const rateLimiter = (maxRequests = 30, windowMs = 15 * 60 * 1000) => (req, res, next) => {
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip || 'unknown';
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
  } else {
    record.count += 1;
  }
  rateLimitMap.set(ip, record);
  if (record.count > maxRequests) {
    return res.status(429).json({ error: 'Too many attempts. Please try again in a few minutes.' });
  }
  next();
};

// ── Input sanitiser ──────────────────────────────────────────────
const sanitize = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>?/gm, '').trim();
};

// ── Data paths & constants ───────────────────────────────────────
const DATA_DIR = path.join(__dirname, 'data');
const COMMISSION_RATE = 0.10;
const GST_RATE = 0.18;

const computeProductPrices = (p) => {
  let basePrice = Number(p.basePrice);
  if (isNaN(basePrice) || basePrice <= 0) {
    const rawPrice = Number(p.price) || 0;
    basePrice = rawPrice > 0 ? Math.round((rawPrice / (1 + COMMISSION_RATE)) * 100) / 100 : 0;
  }
  const commissionAmount = Math.round(basePrice * COMMISSION_RATE * 100) / 100;
  const buyerPrice = Math.round((basePrice + commissionAmount) * 100) / 100;
  return {
    ...p,
    basePrice,
    commissionRate: COMMISSION_RATE,
    commissionAmount,
    price: buyerPrice,
    youReceive: basePrice
  };
};

const { connectDB, readDataAsync, writeDataAsync } = require('./db.js');

// ── Encrypted data read/write ────────────────────────────────────
const readData = async (file) => await readDataAsync(file, DATA_DIR);

const writeData = async (file, data) => await writeDataAsync(file, data, DATA_DIR);


// Encrypt phone + address before storing user, decrypt transparently on read
function encryptUserFields(user) {
  return {
    ...user,
    phone: encryptField(user.phone),
    address: encryptField(user.address)
  };
}

// ── JWT auth middleware ──────────────────────────────────────────
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const requireRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  next();
};

// ══════════════════════════════════════════════════════════════════
//  AUTH ROUTES
// ══════════════════════════════════════════════════════════════════

app.post('/api/auth/register', rateLimiter(5, 60 * 60 * 1000), async (req, res) => {
  let { name, email, password, phone, address, shopName, role } = req.body;
  name     = sanitize(name);
  email    = sanitize(email)?.toLowerCase();
  phone    = sanitize(phone);
  address  = sanitize(address);
  shopName = sanitize(shopName);

  // Public signup: only customer or retailer (admin must be seeded manually)
  if (!['customer', 'retailer'].includes(role)) role = 'customer';
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const users = await readData('users.json');
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email already exists' });

  const hashedPassword = await bcrypt.hash(password, 12); // cost 12 (more secure than 10)
  const rawUser = {
    id: generateUserId(),  // cryptographically strong ID
    name,
    email,
    password: hashedPassword,
    phone: phone || '',
    address: address || '',
    shopName: shopName || (role === 'retailer' ? name + "'s Mandi Store" : ''),
    role,
    createdAt: new Date().toISOString()
  };

  // Encrypt sensitive fields before storing on disk
  const storedUser = encryptUserFields(rawUser);
  users.push(storedUser);
  await writeData('users.json', users);

  const token = jwt.sign({ id: rawUser.id, role: rawUser.role, email: rawUser.email }, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '7d'
  });
  res.json({ token, user: safeUserForSelf(rawUser) });
});

app.post('/api/auth/login', rateLimiter(5, 15 * 60 * 1000), async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = sanitize(email)?.toLowerCase();
  if (!cleanEmail || !password) return res.status(400).json({ error: 'Email and password are required' });

  const users = await readData('users.json');
  const user = users.find(u => u.email.toLowerCase() === cleanEmail);

  // Constant-time comparison to prevent timing attacks
  const dummyHash = '$2a$12$invalidhashfortimingattackprevention00000000000000000000';
  const isValid = user ? await bcrypt.compare(password, user.password) : await bcrypt.compare(password, dummyHash);

  if (!user || !isValid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '7d'
  });

  // Decrypt fields for the response to the user themselves
  const decryptedUser = { ...user, phone: decryptField(user.phone), address: decryptField(user.address) };
  res.json({ token, user: safeUserForSelf(decryptedUser) });
});

// ══════════════════════════════════════════════════════════════════
//  PRODUCT ROUTES
// ══════════════════════════════════════════════════════════════════

app.get('/api/products', async (req, res) => {
  const users = await readData('users.json');
  const products = (await readData('products.json'))
    .filter(p => p.status !== 'deleted')
    .map(p => {
      const computed = computeProductPrices(p);
      const retailer = users.find(u => u.id === p.retailerId);
      // Public product listing: NO user IDs exposed
      return {
        ...computed,
        retailerId: undefined, // strip internal retailer ID from public response
        stock: Number(p.stock) || 0,
        moq: Math.max(1, parseInt(p.moq || 1, 10) || 1),
        available: p.available !== false,
        ...safeRetailerPublic(retailer)
      };
    });
  if (req.query.availableOnly === '1' || req.query.availableOnly === 'true') {
    return res.json(products.filter(p => p.available !== false && Number(p.stock) > 0));
  }
  res.json(products);
});

app.post('/api/products', authenticate, requireRole(['retailer']), async (req, res) => {
  const { name, category, price, basePrice: reqBasePrice, unit, stock, description, image, moq, bulkTiers, grade, origin, harvestDate, available } = req.body;
  if (!name || !category || (price === undefined && reqBasePrice === undefined) || !unit || stock === undefined) {
    return res.status(400).json({ error: 'Name, category, base price, unit and stock are required' });
  }
  const inputBase = reqBasePrice !== undefined ? parseFloat(reqBasePrice) : parseFloat(price);
  if (!(inputBase > 0) || !(parseInt(stock, 10) >= 0)) return res.status(400).json({ error: 'Invalid price or stock' });

  const computed = computeProductPrices({ basePrice: inputBase });
  const products = await readData('products.json');
  const product = {
    id: uuidv4(),
    name: String(name).trim(),
    category,
    basePrice: computed.basePrice,
    commissionRate: COMMISSION_RATE,
    commissionAmount: computed.commissionAmount,
    price: computed.price,
    unit,
    stock: parseInt(stock, 10),
    description: description || '',
    image: image || '',
    moq: Math.max(1, parseInt(moq || 1, 10)),
    bulkTiers: Array.isArray(bulkTiers) ? bulkTiers : [],
    grade: grade || 'Standard',
    origin: origin || '',
    harvestDate: harvestDate || '',
    available: available !== false,
    status: 'active',
    rating: 0,
    ratingCount: 0,
    retailerId: req.user.id,
    createdAt: new Date().toISOString()
  };
  products.push(product);
  await writeData('products.json', products);
  res.status(201).json(computeProductPrices(product));
});

app.patch('/api/products/:id', authenticate, requireRole(['retailer']), async (req, res) => {
  const products = await readData('products.json');
  const idx = products.findIndex(p => p.id === req.params.id && p.retailerId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  const allowed = ['name', 'category', 'basePrice', 'price', 'unit', 'stock', 'description', 'image', 'moq', 'bulkTiers', 'grade', 'origin', 'harvestDate', 'available'];
  allowed.forEach(k => { if (req.body[k] !== undefined) products[idx][k] = req.body[k]; });

  const inputBase = req.body.basePrice !== undefined ? parseFloat(req.body.basePrice) : (products[idx].basePrice || products[idx].price);
  const computed = computeProductPrices({ ...products[idx], basePrice: inputBase });
  products[idx].basePrice = computed.basePrice;
  products[idx].commissionRate = COMMISSION_RATE;
  products[idx].commissionAmount = computed.commissionAmount;
  products[idx].price = computed.price;
  products[idx].stock = parseInt(products[idx].stock, 10);
  products[idx].moq = Math.max(1, parseInt(products[idx].moq || 1, 10));
  if (!(products[idx].basePrice > 0) || !(products[idx].stock >= 0)) return res.status(400).json({ error: 'Invalid price or stock' });
  products[idx].id = req.params.id;
  products[idx].retailerId = req.user.id;
  await writeData('products.json', products);
  res.json(computeProductPrices(products[idx]));
});

app.delete('/api/products/:id', authenticate, requireRole(['retailer']), async (req, res) => {
  const products = await readData('products.json');
  const idx = products.findIndex(p => p.id === req.params.id && p.retailerId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  products[idx].status = 'deleted';
  await writeData('products.json', products);
  res.json({ message: 'Product deleted' });
});

// ══════════════════════════════════════════════════════════════════
//  ORDER ROUTES
// ══════════════════════════════════════════════════════════════════

app.get('/api/orders', authenticate, async (req, res) => {
  const orders = await readData('orders.json');

  if (req.user.role === 'customer') {
    // Customer sees only their own orders — with customerId masked
    return res.json(
      orders
        .filter(o => o.customerId === req.user.id)
        .map(o => ({ ...o, customerId: undefined, customerEmail: undefined }))
    );
  }

  if (req.user.role === 'retailer') {
    const products = await readData('products.json');
    const users = await readData('users.json');
    const retailerOrders = orders.filter(o =>
      o.items.some(i => {
        const product = products.find(p => p.id === i.productId);
        return product && product.retailerId === req.user.id;
      })
    );
    // Retailer sees buyer name + phone for delivery — NOT ID, NOT email
    return res.json(retailerOrders.map(o => {
      const buyer = users.find(u => u.id === o.customerId);
      return {
        ...o,
        customerId: undefined,         // hide internal ID
        customerEmail: undefined,      // hide email
        customerName: buyer ? buyer.name : (o.customerName || 'Customer'),
        customerPhone: buyer ? decryptField(buyer.phone) : (o.customerPhone || ''),
        customerAddress: o.deliveryAddress
      };
    }));
  }

  // Admin sees full order data
  if (req.user.role === 'admin') {
    const users = await readData('users.json');
    return res.json(orders.map(o => {
      const buyer = users.find(u => u.id === o.customerId);
      return {
        ...o,
        customerPhone: buyer ? decryptField(buyer.phone) : (o.customerPhone || ''),
        customerAddress: decryptField(o.deliveryAddress) || o.deliveryAddress
      };
    }));
  }

  res.status(403).json({ error: 'Forbidden' });
});

app.post('/api/orders', authenticate, requireRole(['customer']), async (req, res) => {
  try {
    const { items, deliveryAddress, deliveryNotes } = req.body;
    if (!items || !items.length) return res.status(400).json({ error: 'No items in order' });
    if (!deliveryAddress || !deliveryAddress.trim()) return res.status(400).json({ error: 'Delivery address required' });

    const users = await readData('users.json');
    const customer = users.find(u => u.id === req.user.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const products = await readData('products.json');
    let total = 0, sellerTotal = 0, commissionTotal = 0;

    const orderItems = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.status === 'deleted') throw new Error('Product not found: ' + item.productId);
      const qty = parseInt(item.quantity, 10);
      if (!qty || qty < 1) throw new Error('Invalid quantity for: ' + product.name);
      if (product.stock < qty) throw new Error('Insufficient stock for: ' + product.name + ' (only ' + product.stock + ' left)');

      const computed = computeProductPrices(product);
      const subtotal = Math.round(computed.price * qty * 100) / 100;
      const itemSellerSubtotal = Math.round(computed.basePrice * qty * 100) / 100;
      const itemCommissionSubtotal = Math.round(computed.commissionAmount * qty * 100) / 100;
      total += subtotal;
      sellerTotal += itemSellerSubtotal;
      commissionTotal += itemCommissionSubtotal;

      return {
        productId: item.productId,
        name: product.name,
        unit: product.unit || 'kg',
        quantity: qty,
        basePrice: computed.basePrice,
        commissionAmount: computed.commissionAmount,
        price: computed.price,
        sellerSubtotal: itemSellerSubtotal,
        commissionSubtotal: itemCommissionSubtotal,
        subtotal
      };
    });

    orderItems.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      product.stock -= item.quantity;
    });
    await writeData('products.json', products);

    const gstOnCommission = Math.round(commissionTotal * GST_RATE * 100) / 100;
    const order = {
      id: uuidv4(),
      customerId: req.user.id,
      customerName: customer.name,
      customerEmail: customer.email, // stored internally for admin only
      customerPhone: decryptField(customer.phone),
      deliveryAddress,
      deliveryNotes: deliveryNotes || '',
      items: orderItems,
      total: Math.round(total * 100) / 100,
      sellerTotal: Math.round(sellerTotal * 100) / 100,
      commissionTotal: Math.round(commissionTotal * 100) / 100,
      gstOnCommission,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    const orders = await readData('orders.json');
    orders.push(order);
    await writeData('orders.json', orders);

    // Return order to customer without exposing internal IDs
    res.status(201).json({ ...order, customerId: undefined, customerEmail: undefined });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Customer: edit own pending order
app.put('/api/orders/:id', authenticate, requireRole(['customer']), async (req, res) => {
  try {
    const orders = await readData('orders.json');
    const idx = orders.findIndex(o => o.id === req.params.id && o.customerId === req.user.id);
    if (idx === -1) return res.status(404).json({ error: 'Order not found' });
    const order = orders[idx];
    if (order.status !== 'pending') return res.status(400).json({ error: 'Only pending orders can be edited (current: ' + order.status + ')' });

    const { items, deliveryAddress, deliveryNotes } = req.body;
    if (!items || !items.length) return res.status(400).json({ error: 'Order must have at least one item' });
    const products = await readData('products.json');

    order.items.forEach(oldItem => {
      const p = products.find(x => x.id === oldItem.productId);
      if (p) p.stock += oldItem.quantity;
    });

    let total = 0, sellerTotal = 0, commissionTotal = 0;
    const orderItems = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.status === 'deleted') throw new Error('Product not available: ' + item.productId);
      const qty = parseInt(item.quantity, 10);
      if (!qty || qty < 1) throw new Error('Invalid quantity for: ' + product.name);
      if (product.stock < qty) throw new Error('Insufficient stock for: ' + product.name + ' (only ' + product.stock + ' left)');

      const computed = computeProductPrices(product);
      const subtotal = Math.round(computed.price * qty * 100) / 100;
      const itemSellerSubtotal = Math.round(computed.basePrice * qty * 100) / 100;
      const itemCommissionSubtotal = Math.round(computed.commissionAmount * qty * 100) / 100;
      total += subtotal;
      sellerTotal += itemSellerSubtotal;
      commissionTotal += itemCommissionSubtotal;

      return {
        productId: item.productId,
        name: product.name,
        unit: product.unit || 'kg',
        quantity: qty,
        basePrice: computed.basePrice,
        commissionAmount: computed.commissionAmount,
        price: computed.price,
        sellerSubtotal: itemSellerSubtotal,
        commissionSubtotal: itemCommissionSubtotal,
        subtotal
      };
    });

    orderItems.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      product.stock -= item.quantity;
    });
    await writeData('products.json', products);

    const gstOnCommission = Math.round(commissionTotal * GST_RATE * 100) / 100;
    order.items = orderItems;
    order.total = Math.round(total * 100) / 100;
    order.sellerTotal = Math.round(sellerTotal * 100) / 100;
    order.commissionTotal = Math.round(commissionTotal * 100) / 100;
    order.gstOnCommission = gstOnCommission;
    if (typeof deliveryAddress === 'string' && deliveryAddress.trim()) order.deliveryAddress = deliveryAddress;
    if (typeof deliveryNotes === 'string') order.deliveryNotes = deliveryNotes;
    order.updatedAt = new Date().toISOString();
    await writeData('orders.json', orders);

    res.json({ ...order, customerId: undefined, customerEmail: undefined });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Customer: cancel own pending order
app.delete('/api/orders/:id', authenticate, requireRole(['customer']), async (req, res) => {
  const orders = await readData('orders.json');
  const idx = orders.findIndex(o => o.id === req.params.id && o.customerId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Order not found' });
  const order = orders[idx];
  if (order.status !== 'pending') return res.status(400).json({ error: 'Only pending orders can be cancelled (current: ' + order.status + ')' });
  const products = await readData('products.json');
  order.items.forEach(item => {
    const p = products.find(x => x.id === item.productId);
    if (p) p.stock += item.quantity;
  });
  await writeData('products.json', products);
  order.status = 'cancelled';
  order.updatedAt = new Date().toISOString();
  await writeData('orders.json', orders);
  res.json({ message: 'Order cancelled', order: { ...order, customerId: undefined, customerEmail: undefined } });
});

// Retailer: update order status
app.patch('/api/orders/:id/status', authenticate, requireRole(['retailer']), async (req, res) => {
  const allowed = ['confirmed', 'ready', 'dispatched', 'delivered', 'cancelled'];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ error: 'Invalid status' });
  const orders = await readData('orders.json');
  const idx = orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Order not found' });
  const order = orders[idx];
  const products = await readData('products.json');
  const hasRetailerProduct = order.items.some(i => {
    const product = products.find(p => p.id === i.productId);
    return product && product.retailerId === req.user.id;
  });
  if (!hasRetailerProduct) return res.status(403).json({ error: 'Not your order' });
  const flow = { pending: ['confirmed', 'cancelled'], confirmed: ['ready', 'cancelled'], ready: ['dispatched', 'cancelled'], dispatched: ['delivered'], delivered: [], cancelled: [] };
  if (!(flow[order.status] || []).includes(req.body.status)) return res.status(400).json({ error: 'Cannot move order from ' + order.status + ' to ' + req.body.status });
  if (req.body.status === 'cancelled' && !['pending', 'confirmed', 'ready'].includes(order.status)) return res.status(400).json({ error: 'Only pending/confirmed/ready orders can be cancelled' });
  if (req.body.status === 'cancelled' && req.body.reason) order.cancelReason = String(req.body.reason).slice(0, 300);
  if (req.body.status === 'cancelled') {
    order.items.forEach(item => {
      const p = products.find(x => x.id === item.productId && x.retailerId === req.user.id);
      if (p) p.stock += item.quantity;
    });
    await writeData('products.json', products);
  }
  order.status = req.body.status;
  order.updatedAt = new Date().toISOString();
  await writeData('orders.json', orders);
  res.json({ ...order, customerId: undefined, customerEmail: undefined });
});

// Confirm receipt (dispatched/ready → delivered)
app.patch('/api/orders/:id/receive', authenticate, async (req, res) => {
  const orders = await readData('orders.json');
  const idx = orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Order not found' });
  const order = orders[idx];
  const products = await readData('products.json');
  const isCustomer = order.customerId === req.user.id;
  const isRetailer = order.items.some(i => {
    const product = products.find(p => p.id === i.productId);
    return product && product.retailerId === req.user.id;
  });
  if (!isCustomer && !isRetailer && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (!['dispatched', 'ready'].includes(order.status)) {
    return res.status(400).json({ error: 'Can only confirm receipt of dispatched or ready orders (current: ' + order.status + ')' });
  }
  order.status = 'delivered';
  order.receivedAt = new Date().toISOString();
  order.updatedAt = new Date().toISOString();
  await writeData('orders.json', orders);
  res.json({ ...order, customerId: undefined, customerEmail: undefined });
});

// ══════════════════════════════════════════════════════════════════
//  ADMIN ROUTES (admin only — full data with decrypted fields)
// ══════════════════════════════════════════════════════════════════

app.get('/api/admin/stats', authenticate, requireRole(['admin']), async (req, res) => {
  const users = await readData('users.json');
  const products = (await readData('products.json')).filter(p => p.status !== 'deleted');
  const orders = await readData('orders.json');
  const activeOrders = orders.filter(o => o.status !== 'cancelled');
  const byStatus = {};
  orders.forEach(o => { byStatus[o.status] = (byStatus[o.status] || 0) + 1; });

  const totalRevenue = activeOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalCommission = activeOrders.reduce((sum, o) => sum + (o.commissionTotal || (o.total * COMMISSION_RATE)), 0);
  const totalGstOnCommission = Math.round(totalCommission * GST_RATE * 100) / 100;
  const netSellerPayouts = activeOrders.reduce((sum, o) => sum + (o.sellerTotal || (o.total * (1 - COMMISSION_RATE))), 0);

  res.json({
    totalUsers: users.length,
    customers: users.filter(u => u.role === 'customer').length,
    retailers: users.filter(u => u.role === 'retailer').length,
    totalProducts: products.length,
    lowStock: products.filter(p => p.stock <= 20).length,
    totalOrders: orders.length,
    ordersByStatus: byStatus,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalCommission: Math.round(totalCommission * 100) / 100,
    totalGstOnCommission,
    netSellerPayouts: Math.round(netSellerPayouts * 100) / 100
  });
});

// Admin: list all users with decrypted PII (admin only)
app.get('/api/admin/users', authenticate, requireRole(['admin']), async (req, res) => {
  const users = await readData('users.json');
  // Admin sees full user data including decrypted phone/address — NO password
  res.json(users.map(u => safeUserForAdmin(u)));
});

// Admin: list all orders with full detail
app.get('/api/admin/orders', authenticate, requireRole(['admin']), async (req, res) => {
  const orders = await readData('orders.json');
  const users = await readData('users.json');
  res.json(orders.map(o => {
    const buyer = users.find(u => u.id === o.customerId);
    return {
      ...o,
      customerPhone: buyer ? decryptField(buyer.phone) : (o.customerPhone || ''),
    };
  }));
});

// ══════════════════════════════════════════════════════════════════
//  DATA SEEDING & SERVER INITIALIZATION
// ══════════════════════════════════════════════════════════════════

const SEED_DIR = path.join(DATA_DIR, 'seed');

async function seedData() {
  const files = [
    { live: 'users.json',    seed: 'users.seed.json'    },
    { live: 'products.json', seed: 'products.seed.json' },
    { live: 'orders.json',   seed: null                  }
  ];

  for (const { live, seed } of files) {
    const livePath  = path.join(DATA_DIR, live);
    if (fs.existsSync(livePath)) continue; // never overwrite live data

    if (!seed) {
      fs.writeFileSync(livePath, '[]');
      console.log('[seed] Created empty ' + live);
      continue;
    }

    const seedPath = path.join(SEED_DIR, seed);
    if (fs.existsSync(seedPath)) {
      fs.copyFileSync(seedPath, livePath);
      console.log('[seed] Initialised ' + live + ' from seed');
    } else {
      console.warn('[seed] Seed file not found: ' + seedPath + ' — using inline fallback');
      if (live === 'users.json') {
        const hash = bcrypt.hashSync('admin123', 12);
        await writeData('users.json', [
          { id: 'admin1', name: 'Admin', email: 'admin@market.com', password: hash,
            phone: encryptField('9999999999'), address: encryptField('Market HQ'),
            role: 'admin', createdAt: new Date().toISOString() }
        ]);
      } else if (live === 'products.json') {
        await writeData('products.json', []);
      }
    }
  }
}

async function startServer() {
  await connectDB(DATA_DIR);
  await seedData();
  app.listen(PORT, () => console.log('Marketplace running on http://localhost:' + PORT));
}

startServer();