const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'veggitable_secret_key_2024';

// Security Headers & Middlewares
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

// In-Memory IP Rate Limiter for Authentication
const rateLimitMap = new Map();
const rateLimiter = (maxRequests = 10, windowMs = 15 * 60 * 1000) => (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
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
    return res.status(429).json({ error: 'Too many authentication attempts. Please try again in 15 minutes.' });
  }
  next();
};

const sanitize = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>?/gm, '').trim();
};

const DATA_DIR = path.join(__dirname, 'data');

const readData = (file) => {
  const filePath = path.join(DATA_DIR, file);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const writeData = (file, data) => {
  const filePath = path.join(DATA_DIR, file);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const requireRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  next();
};

app.post('/api/auth/register', rateLimiter(10, 15 * 60 * 1000), async (req, res) => {
  let { name, email, password, phone, address, shopName, role } = req.body;
  name = sanitize(name);
  email = sanitize(email)?.toLowerCase();
  phone = sanitize(phone);
  address = sanitize(address);
  shopName = sanitize(shopName);

  // Security: public signup can only create customer/retailer. Admins must exist in DB / be created manually.
  if (!['customer', 'retailer'].includes(role)) role = 'customer';
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
  const users = readData('users.json');
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email already exists' });
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    id: uuidv4(),
    name,
    email,
    password: hashedPassword,
    phone: phone || '',
    address: address || '',
    shopName: shopName || (role === 'retailer' ? name + "'s Mandi Store" : ''),
    role,
    createdAt: new Date().toISOString()
  };
  users.push(user);
  writeData('users.json', users);
  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, address: user.address, shopName: user.shopName, role: user.role } });
});

app.post('/api/auth/login', rateLimiter(15, 15 * 60 * 1000), async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = sanitize(email)?.toLowerCase();
  const users = readData('users.json');
  const user = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, address: user.address, shopName: user.shopName, role: user.role } });
});
app.get('/api/products', (req, res) => {
  const users = readData('users.json');
  const products = readData('products.json')
    .filter(p => p.status !== 'deleted')
    .map(p => {
      const retailer = users.find(u => u.id === p.retailerId);
      return {
        ...p,
        price: Number(p.price) || 0,
        stock: Number(p.stock) || 0,
        moq: Math.max(1, parseInt(p.moq || 1, 10) || 1),
        available: p.available !== false,
        retailerName: retailer ? retailer.name : 'Verified Retailer',
        shopName: retailer ? (retailer.shopName || retailer.name + "'s Store") : 'Fresh Produce Mandi',
        retailerLocation: retailer ? (retailer.address || retailer.location || 'Local Mandi') : 'Local Mandi',
        retailerPhone: retailer ? retailer.phone : ''
      };
    });
  if (req.query.availableOnly === '1' || req.query.availableOnly === 'true') {
    return res.json(products.filter(p => p.available !== false && Number(p.stock) > 0));
  }
  res.json(products);
});

app.post('/api/products', authenticate, requireRole(['retailer']), (req, res) => {
  const { name, category, price, unit, stock, description, image, moq, bulkTiers, grade, origin, harvestDate, available } = req.body;
  if (!name || !category || price === undefined || !unit || stock === undefined) return res.status(400).json({ error: 'Name, category, price, unit and stock are required' });
  const products = readData('products.json');
  const product = { id: uuidv4(), name: String(name).trim(), category, price: parseFloat(price), unit, stock: parseInt(stock, 10), description: description || '', image: image || '', moq: Math.max(1, parseInt(moq || 1, 10)), bulkTiers: Array.isArray(bulkTiers) ? bulkTiers : [], grade: grade || 'Standard', origin: origin || '', harvestDate: harvestDate || '', available: available !== false, status: 'active', rating: 0, ratingCount: 0, retailerId: req.user.id, createdAt: new Date().toISOString() };
  if (!(product.price > 0) || !(product.stock >= 0)) return res.status(400).json({ error: 'Invalid price or stock' });
  products.push(product);
  writeData('products.json', products);
  res.status(201).json(product);
});

app.patch('/api/products/:id', authenticate, requireRole(['retailer']), (req, res) => {
  const products = readData('products.json');
  const idx = products.findIndex(p => p.id === req.params.id && p.retailerId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  const allowed = ['name', 'category', 'price', 'unit', 'stock', 'description', 'image', 'moq', 'bulkTiers', 'grade', 'origin', 'harvestDate', 'available'];
  allowed.forEach(k => { if (req.body[k] !== undefined) products[idx][k] = req.body[k]; });
  products[idx].price = parseFloat(products[idx].price);
  products[idx].stock = parseInt(products[idx].stock, 10);
  products[idx].moq = Math.max(1, parseInt(products[idx].moq || 1, 10));
  if (!(products[idx].price > 0) || !(products[idx].stock >= 0)) return res.status(400).json({ error: 'Invalid price or stock' });
  products[idx].id = req.params.id;
  products[idx].retailerId = req.user.id;
  writeData('products.json', products);
  res.json(products[idx]);
});

app.delete('/api/products/:id', authenticate, requireRole(['retailer']), (req, res) => {
  const products = readData('products.json');
  const idx = products.findIndex(p => p.id === req.params.id && p.retailerId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  products[idx].status = 'deleted';
  writeData('products.json', products);
  res.json({ message: 'Product deleted' });
});

app.get('/api/orders', authenticate, (req, res) => {
  const orders = readData('orders.json');
  if (req.user.role === 'customer') {
    return res.json(orders.filter(o => o.customerId === req.user.id));
  }
  if (req.user.role === 'retailer') {
    const retailerOrders = orders.filter(o => o.items.some(i => {
      const product = readData('products.json').find(p => p.id === i.productId);
      return product && product.retailerId === req.user.id;
    }));
    // Show buyer name and phone to retailer for fulfillment
    const users = readData('users.json');
    const sanitized = retailerOrders.map(o => {
      const buyer = users.find(u => u.id === o.customerId);
      return {
        ...o,
        customerName: buyer ? buyer.name : (o.customerName || 'Customer #' + o.customerId.slice(0, 8)),
        customerPhone: buyer ? buyer.phone : o.customerPhone,
        customerEmail: undefined,
        customerAddress: o.deliveryAddress
      };
    });
    return res.json(sanitized);
  }
  res.json(orders);
});
app.post('/api/orders', authenticate, requireRole(['customer']), (req, res) => {
  try {
    const { items, deliveryAddress, deliveryNotes } = req.body;
    if (!items || !items.length) return res.status(400).json({ error: 'No items in order' });
    if (!deliveryAddress || !deliveryAddress.trim()) return res.status(400).json({ error: 'Delivery address required' });
    const users = readData('users.json');
    const customer = users.find(u => u.id === req.user.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    const products = readData('products.json');
    let total = 0;
    const orderItems = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.status === 'deleted') throw new Error('Product not found: ' + item.productId);
      const qty = parseInt(item.quantity, 10);
      if (!qty || qty < 1) throw new Error('Invalid quantity for: ' + product.name);
      if (product.stock < qty) throw new Error('Insufficient stock for: ' + product.name + ' (only ' + product.stock + ' left)');
      const subtotal = product.price * qty;
      total += subtotal;
      return { productId: item.productId, name: product.name, quantity: qty, price: product.price, subtotal };
    });
    orderItems.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      product.stock -= item.quantity;
    });
    writeData('products.json', products);
    const order = {
      id: uuidv4(),
      customerId: req.user.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      deliveryAddress,
      deliveryNotes: deliveryNotes || '',
      items: orderItems,
      total,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    const orders = readData('orders.json');
    orders.push(order);
    writeData('orders.json', orders);
    res.status(201).json(order);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
// Customer: edit own pending order (change quantities / remove items / address)
app.put('/api/orders/:id', authenticate, requireRole(['customer']), (req, res) => {
  try {
    const orders = readData('orders.json');
    const idx = orders.findIndex(o => o.id === req.params.id && o.customerId === req.user.id);
    if (idx === -1) return res.status(404).json({ error: 'Order not found' });
    const order = orders[idx];
    if (order.status !== 'pending') return res.status(400).json({ error: 'Only pending orders can be edited (current: ' + order.status + ')' });
    const { items, deliveryAddress, deliveryNotes } = req.body;
    if (!items || !items.length) return res.status(400).json({ error: 'Order must have at least one item' });
    const products = readData('products.json');
    // Return old stock first so validation uses correct availability
    order.items.forEach(oldItem => {
      const p = products.find(x => x.id === oldItem.productId);
      if (p) p.stock += oldItem.quantity;
    });
    let total = 0;
    const orderItems = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.status === 'deleted') throw new Error('Product not available: ' + item.productId);
      const qty = parseInt(item.quantity, 10);
      if (!qty || qty < 1) throw new Error('Invalid quantity for: ' + product.name);
      if (product.stock < qty) throw new Error('Insufficient stock for: ' + product.name + ' (only ' + product.stock + ' left)');
      const subtotal = product.price * qty;
      total += subtotal;
      return { productId: item.productId, name: product.name, quantity: qty, price: product.price, subtotal };
    });
    // Deduct new quantities
    orderItems.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      product.stock -= item.quantity;
    });
    writeData('products.json', products);
    order.items = orderItems;
    order.total = total;
    if (typeof deliveryAddress === 'string' && deliveryAddress.trim()) order.deliveryAddress = deliveryAddress;
    if (typeof deliveryNotes === 'string') order.deliveryNotes = deliveryNotes;
    order.updatedAt = new Date().toISOString();
    writeData('orders.json', orders);
    res.json(order);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
// Customer: cancel own pending order (restores stock, marks cancelled)
app.delete('/api/orders/:id', authenticate, requireRole(['customer']), (req, res) => {
  const orders = readData('orders.json');
  const idx = orders.findIndex(o => o.id === req.params.id && o.customerId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Order not found' });
  const order = orders[idx];
  if (order.status !== 'pending') return res.status(400).json({ error: 'Only pending orders can be cancelled (current: ' + order.status + ')' });
  const products = readData('products.json');
  order.items.forEach(item => {
    const p = products.find(x => x.id === item.productId);
    if (p) p.stock += item.quantity;
  });
  writeData('products.json', products);
  order.status = 'cancelled';
  order.updatedAt = new Date().toISOString();
  writeData('orders.json', orders);
  res.json({ message: 'Order cancelled', order });
});
app.patch('/api/orders/:id/status', authenticate, requireRole(['retailer']), (req, res) => {
  const allowed = ['confirmed', 'ready', 'dispatched', 'delivered', 'cancelled'];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ error: 'Invalid status' });
  const orders = readData('orders.json');
  const idx = orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Order not found' });
  const order = orders[idx];
  const hasRetailerProduct = order.items.some(i => {
    const product = readData('products.json').find(p => p.id === i.productId);
    return product && product.retailerId === req.user.id;
  });
  if (!hasRetailerProduct) return res.status(403).json({ error: 'Not your order' });
  // Updated flow: pending → confirmed → ready → dispatched → delivered
  const flow = { pending: ['confirmed', 'cancelled'], confirmed: ['ready', 'cancelled'], ready: ['dispatched', 'cancelled'], dispatched: ['delivered'], delivered: [], cancelled: [] };
  if (!(flow[order.status] || []).includes(req.body.status)) return res.status(400).json({ error: 'Cannot move order from ' + order.status + ' to ' + req.body.status });
  if (req.body.status === 'cancelled' && !['pending','confirmed','ready'].includes(order.status)) return res.status(400).json({ error: 'Only pending/confirmed/ready orders can be cancelled' });
  if (req.body.status === 'cancelled' && req.body.reason) order.cancelReason = String(req.body.reason).slice(0, 300);
  // Retailer cancels before dispatch: restore stock for their items only
  if (req.body.status === 'cancelled') {
    const products = readData('products.json');
    order.items.forEach(item => {
      const p = products.find(x => x.id === item.productId && x.retailerId === req.user.id);
      if (p) p.stock += item.quantity;
    });
    writeData('products.json', products);
  }
  order.status = req.body.status;
  order.updatedAt = new Date().toISOString();
  writeData('orders.json', orders);
  res.json(order);
});

// Confirm order received (dispatched → delivered)
app.patch('/api/orders/:id/receive', authenticate, (req, res) => {
  const orders = readData('orders.json');
  const idx = orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Order not found' });
  const order = orders[idx];
  const isCustomer = order.customerId === req.user.id;
  const isRetailer = order.items.some(i => {
    const product = readData('products.json').find(p => p.id === i.productId);
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
  writeData('orders.json', orders);
  res.json(order);
});

app.get('/api/admin/stats', authenticate, requireRole(['admin']), (req, res) => {
  const users = readData('users.json');
  const products = readData('products.json').filter(p => p.status !== 'deleted');
  const orders = readData('orders.json');
  const byStatus = {};
  orders.forEach(o => { byStatus[o.status] = (byStatus[o.status] || 0) + 1; });
  res.json({
    totalUsers: users.length,
    customers: users.filter(u => u.role === 'customer').length,
    retailers: users.filter(u => u.role === 'retailer').length,
    totalProducts: products.length,
    lowStock: products.filter(p => p.stock <= 20).length,
    totalOrders: orders.length,
    ordersByStatus: byStatus,
    totalRevenue: orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0)
  });
});

app.get('/api/admin/users', authenticate, requireRole(['admin']), (req, res) => {
  const users = readData('users.json');
  res.json(users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt })));
});
function seedData() {
  if (!fs.existsSync(path.join(DATA_DIR, 'products.json'))) {
    writeData('products.json', [
      { id: 'p1', name: 'Fresh Tomatoes', category: 'Vegetables', price: 25, unit: 'kg', stock: 200, description: 'Premium vine-ripened tomatoes', image: 'tomato', status: 'active', retailerId: 'ret1', createdAt: new Date().toISOString() },
      { id: 'p2', name: 'Organic Spinach', category: 'Vegetables', price: 40, unit: 'bunch', stock: 150, description: 'Fresh organic spinach', image: 'spinach', status: 'active', retailerId: 'ret1', createdAt: new Date().toISOString() },
      { id: 'p3', name: 'Potatoes', category: 'Vegetables', price: 15, unit: 'kg', stock: 500, description: 'Premium potatoes', image: 'potato', status: 'active', retailerId: 'ret2', createdAt: new Date().toISOString() }
    ]);
  }
  if (!fs.existsSync(path.join(DATA_DIR, 'users.json'))) {
    const hash = bcrypt.hashSync('admin123', 10);
    writeData('users.json', [
      { id: 'admin1', name: 'Admin', email: 'admin@market.com', password: hash, phone: '9999999999', address: 'Market HQ', role: 'admin', createdAt: new Date().toISOString() },
      { id: 'ret1', name: 'Demo Retailer', email: 'retailer@demo.com', password: hash, phone: '9000000001', address: 'Mandi Road', role: 'retailer', createdAt: new Date().toISOString() },
      { id: 'cust1', name: 'Demo Customer', email: 'customer@demo.com', password: hash, phone: '9000000002', address: 'Buyer Street', role: 'customer', createdAt: new Date().toISOString() }
    ]);
  }
  if (!fs.existsSync(path.join(DATA_DIR, 'orders.json'))) {
    writeData('orders.json', []);
  }
}

seedData();

app.listen(PORT, () => console.log('Marketplace running on http://localhost:' + PORT));