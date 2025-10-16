const express = require('express');
const cors = require('cors');
const path = require('path');
const { db, migrate } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure schema
migrate();

// Helpers
function getProductById(productId) {
  return db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
}

// Products API
app.get('/api/products', (req, res) => {
  const { q, category } = req.query;
  let sql = 'SELECT * FROM products';
  const params = [];
  const where = [];
  if (q) {
    where.push('(LOWER(name) LIKE ? OR LOWER(description) LIKE ?)');
    params.push(`%${String(q).toLowerCase()}%`, `%${String(q).toLowerCase()}%`);
  }
  if (category) {
    where.push('LOWER(category) = ?');
    params.push(String(category).toLowerCase());
  }
  if (where.length > 0) sql += ' WHERE ' + where.join(' AND ');
  sql += ' ORDER BY created_at DESC';
  const products = db.prepare(sql).all(...params);
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(product);
});

app.post('/api/products', (req, res) => {
  const { name, description, price, image, stock, category, isEco } = req.body;
  if (!name || price == null) return res.status(400).json({ error: 'name y price son obligatorios' });
  const insert = db.prepare(`
    INSERT INTO products (name, description, price, image, stock, category, isEco)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const info = insert.run(name, description || '', Number(price), image || '', Number(stock || 0), category || null, Number(isEco || 0));
  res.status(201).json(getProductById(info.lastInsertRowid));
});

app.put('/api/products/:id', (req, res) => {
  const { name, description, price, image, stock, category, isEco } = req.body;
  const existing = getProductById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Producto no encontrado' });
  const update = db.prepare(`
    UPDATE products SET name = ?, description = ?, price = ?, image = ?, stock = ?, category = ?, isEco = ?
    WHERE id = ?
  `);
  update.run(
    name ?? existing.name,
    description ?? existing.description,
    price != null ? Number(price) : existing.price,
    image ?? existing.image,
    stock != null ? Number(stock) : existing.stock,
    category ?? existing.category,
    isEco != null ? Number(isEco) : existing.isEco,
    req.params.id
  );
  res.json(getProductById(req.params.id));
});

app.delete('/api/products/:id', (req, res) => {
  const del = db.prepare('DELETE FROM products WHERE id = ?');
  const info = del.run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Producto no encontrado' });
  res.status(204).end();
});

// Orders API
app.get('/api/orders', (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  const itemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
  const withItems = orders.map(o => ({ ...o, items: itemsStmt.all(o.id) }));
  res.json(withItems);
});

app.post('/api/orders', (req, res) => {
  const { items } = req.body; // [{ productId, quantity }]
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items es requerido' });
  }

  const getForUpdate = db.prepare('SELECT * FROM products WHERE id = ?');
  const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
  const insertOrder = db.prepare('INSERT INTO orders (total) VALUES (?)');
  const insertItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');

  try {
    const transaction = db.transaction(() => {
      let total = 0;
      // Validar stock y calcular total
      for (const it of items) {
        const p = getForUpdate.get(it.productId);
        if (!p) throw new Error(`Producto ${it.productId} no existe`);
        const qty = Number(it.quantity || 0);
        if (qty <= 0) throw new Error('Cantidad inválida');
        if (p.stock < qty) throw new Error(`Stock insuficiente para ${p.name}`);
        total += p.price * qty;
      }
      const orderInfo = insertOrder.run(total);
      const orderId = orderInfo.lastInsertRowid;
      for (const it of items) {
        const p = getForUpdate.get(it.productId);
        const qty = Number(it.quantity);
        insertItem.run(orderId, p.id, qty, p.price);
        updateStock.run(qty, p.id);
      }
      return { orderId, total };
    });

    const result = transaction();
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.orderId);
    const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(result.orderId);
    res.status(201).json({ ...order, items: orderItems });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});


