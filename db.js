const Database = require('better-sqlite3');
const path = require('path');

const dbFilePath = path.join(__dirname, 'supermercado.db');
const db = new Database(dbFilePath);

function migrate() {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL CHECK(price >= 0),
      image TEXT,
      stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
      category TEXT,
      isEco INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  
  // Añadir columna isEco si no existe
  try {
    db.exec(`ALTER TABLE products ADD COLUMN isEco INTEGER DEFAULT 0;`);
  } catch (e) {
    // Columna ya existe, ignorar error
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total REAL NOT NULL CHECK(total >= 0),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      price REAL NOT NULL CHECK(price >= 0),
      FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY(product_id) REFERENCES products(id)
    );
  `);
}

module.exports = { db, migrate };


