const sqlite3 = require('sqlite3').verbose();
const supabase = require('./supabase');
const path = require('path');

// Conectar a SQLite existente
const dbPath = path.join(__dirname, 'supermercado.db');
const db = new sqlite3.Database(dbPath);

async function migrateToSupabase() {
  console.log('🚀 Iniciando migración a Supabase...');
  
  try {
    // Migrar productos
    console.log('📦 Migrando productos...');
    const products = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM products', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    for (const product of products) {
      const { error } = await supabase
        .from('products')
        .insert([{
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          stock: product.stock,
          category: product.category,
          is_eco: Boolean(product.isEco)
        }]);
      
      if (error) {
        console.error('Error migrando producto:', product.name, error);
      } else {
        console.log(`✅ Producto migrado: ${product.name}`);
      }
    }
    
    // Migrar usuarios
    console.log('👥 Migrando usuarios...');
    const users = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM users', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    for (const user of users) {
      const { error } = await supabase
        .from('users')
        .insert([{
          name: user.name,
          email: user.email,
          password: user.password,
          is_admin: Boolean(user.isAdmin)
        }]);
      
      if (error) {
        console.error('Error migrando usuario:', user.name, error);
      } else {
        console.log(`✅ Usuario migrado: ${user.name}`);
      }
    }
    
    // Migrar pedidos
    console.log('📋 Migrando pedidos...');
    const orders = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM orders', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    for (const order of orders) {
      const { error } = await supabase
        .from('orders')
        .insert([{
          user_id: order.user_id,
          status: order.status,
          payment_method: order.payment_method,
          delivery_method: order.delivery_method,
          shipping_cost: order.shipping_cost,
          subtotal: order.subtotal || 0,
          tax: order.tax,
          total: order.total,
          items_summary: order.items_summary,
          items: order.items ? JSON.parse(order.items) : null,
          deleted: order.deleted
        }]);
      
      if (error) {
        console.error('Error migrando pedido:', order.id, error);
      } else {
        console.log(`✅ Pedido migrado: #${order.id}`);
      }
    }
    
    console.log('🎉 Migración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    db.close();
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migrateToSupabase();
}

module.exports = migrateToSupabase;
