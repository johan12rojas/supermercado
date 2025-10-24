const express = require('express');
const cors = require('cors');
const path = require('path');
const supabase = require('./supabase');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/views', express.static(path.join(__dirname, 'views')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Ruta principal - redirigir a index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Products API
app.get('/api/products', async (req, res) => {
  try {
    const { q, category, discount } = req.query;
    let query = supabase.from('products').select('*');
    
    if (q) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }
    
    if (category) {
      query = query.eq('category', category);
    }
    
    // Filtro de descuentos
    if (discount === 'true') {
      query = query.gt('discount_percentage', 0);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    // Convertir campos de Supabase al formato esperado por el frontend
    const convertedData = (data || []).map(product => ({
      ...product,
      isEco: product.is_eco ? 1 : 0,
      discount_percentage: product.discount_percentage || 0
    }));
    
    res.json(convertedData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching product:', error);
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    // Convertir campos de Supabase al formato esperado por el frontend
    const convertedData = {
      ...data,
      isEco: data.is_eco ? 1 : 0,
      discount_percentage: data.discount_percentage || 0
    };
    
    res.json(convertedData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const productData = req.body;
    
    // Convertir campos del frontend a la estructura de Supabase
    const supabaseData = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      image: productData.image,
      stock: productData.stock,
      category: productData.category,
      is_eco: productData.isEco || false
    };
    
    // Agregar discount_percentage si se proporciona
    if (productData.discount !== undefined) {
      supabaseData.discount_percentage = productData.discount || 0;
    }
    
    const { data, error } = await supabase
      .from('products')
      .insert([supabaseData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating product:', error);
      return res.status(400).json({ error: 'Error al crear producto' });
    }
    
    // Convertir respuesta de Supabase al formato esperado por el frontend
    const responseData = {
      ...data,
      isEco: data.is_eco ? 1 : 0,
      discount_percentage: data.discount_percentage || 0
    };
    
    res.json(responseData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Convertir campos del frontend a la estructura de Supabase
    const supabaseUpdates = {
      name: updates.name,
      description: updates.description,
      price: updates.price,
      image: updates.image,
      stock: updates.stock,
      category: updates.category,
      is_eco: updates.isEco || false
    };
    
    // Agregar discount_percentage si se proporciona
    if (updates.discount !== undefined) {
      supabaseUpdates.discount_percentage = updates.discount || 0;
    }
    
    const { data, error } = await supabase
      .from('products')
      .update(supabaseUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating product:', error);
      return res.status(400).json({ error: 'Error al actualizar producto' });
    }
    
    // Convertir respuesta de Supabase al formato esperado por el frontend
    const responseData = {
      ...data,
      isEco: data.is_eco ? 1 : 0,
      discount_percentage: data.discount_percentage || 0
    };
    
    res.json(responseData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting product:', error);
      return res.status(400).json({ error: 'Error al eliminar producto' });
    }
    
    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Auth API (compatible con frontend)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();
    
    if (error || !data) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Convertir is_admin a isAdmin para compatibilidad con frontend
    const user = {
      ...data,
      isAdmin: data.is_admin ? 1 : 0
    };
    
    res.json(user);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email, password, is_admin: false }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      return res.status(400).json({ error: 'Error al crear usuario' });
    }
    
    // Convertir is_admin a isAdmin para compatibilidad con frontend
    const user = {
      ...data,
      isAdmin: data.is_admin ? 1 : 0
    };
    
    res.json(user);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Categories API
app.get('/api/categories', async (req, res) => {
  try {
    // Obtener categorías únicas de los productos
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .not('category', 'is', null);
    
    if (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    // Crear lista de categorías únicas
    const uniqueCategories = [...new Set(data.map(item => item.category))];
    const categories = uniqueCategories.map((name, index) => ({
      id: index + 1,
      name: name,
      description: `Productos de ${name}`
    }));
    
    res.json(categories);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Verificar si la categoría ya existe
    const { data: existing, error: checkError } = await supabase
      .from('products')
      .select('category')
      .eq('category', name)
      .limit(1);
    
    if (checkError) {
      console.error('Error checking category:', checkError);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'La categoría ya existe' });
    }
    
    // Crear un producto temporal para establecer la categoría
    const { data, error } = await supabase
      .from('products')
      .insert([{
        name: `Producto temporal - ${name}`,
        description: description || `Productos de ${name}`,
        price: 0,
        image: '',
        stock: 0,
        category: name,
        is_eco: false
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating category:', error);
      return res.status(400).json({ error: 'Error al crear categoría' });
    }
    
    res.json({ id: data.id, name, description });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // Actualizar todos los productos de esta categoría
    const { error } = await supabase
      .from('products')
      .update({ category: name })
      .eq('category', id);
    
    if (error) {
      console.error('Error updating category:', error);
      return res.status(400).json({ error: 'Error al actualizar categoría' });
    }
    
    res.json({ id, name, description });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Eliminar productos de esta categoría
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('category', id);
    
    if (error) {
      console.error('Error deleting category:', error);
      return res.status(400).json({ error: 'Error al eliminar categoría' });
    }
    
    res.json({ message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Orders API
app.get('/api/orders', async (req, res) => {
  try {
    const { user_id } = req.query;
    let query = supabase.from('orders').select('*');
    
    if (user_id) {
      query = query.eq('user_id', user_id);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    res.json(data || []);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating order:', error);
      return res.status(400).json({ error: 'Error al crear pedido' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating order:', error);
      return res.status(400).json({ error: 'Error al actualizar pedido' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Admin API - eliminado endpoint duplicado

// Users API
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // Convertir campos de Supabase al formato esperado por el frontend
    const user = {
      ...data,
      isAdmin: data.is_admin ? 1 : 0
    };
    
    res.json(user);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Orders API
app.get('/api/orders/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    res.json(data || []);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Orders Stats API
app.get('/api/orders/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Obtener todas las órdenes del usuario
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching orders for stats:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    // Calcular estadísticas
    const totalOrders = orders?.length || 0;
    const totalSpent = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    const lastOrderDate = orders && orders.length > 0 ? orders[0].created_at : null;
    
    // Estadísticas mensuales (últimos 6 meses)
    const monthlyStats = [];
    const now = new Date();
    
    for (let i = 0; i < 6; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = month.toISOString().substring(0, 7); // YYYY-MM
      
      const monthOrders = orders?.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getFullYear() === month.getFullYear() && 
               orderDate.getMonth() === month.getMonth();
      }) || [];
      
      const monthTotal = monthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      monthlyStats.push({
        month: monthStr,
        orders_count: monthOrders.length,
        total_spent: monthTotal
      });
    }
    
    res.json({
      total_orders: totalOrders,
      total_spent: totalSpent,
      avg_order_value: avgOrderValue,
      last_order_date: lastOrderDate,
      monthlyStats: monthlyStats.reverse() // Ordenar cronológicamente
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Test endpoint para admin stats
app.get('/api/admin/test', async (req, res) => {
  try {
    console.log('🧪 Test endpoint llamado');
    res.json({ 
      message: 'Test endpoint funcionando',
      timestamp: new Date().toISOString(),
      orders: 53,
      sales: 1000.50
    });
  } catch (error) {
    console.error('❌ Error en test endpoint:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Admin Stats API
app.get('/api/admin/stats', async (req, res) => {
  try {
    console.log('🔍 Obteniendo estadísticas de administrador...');
    
    // Obtener todas las órdenes
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*');
    
    if (ordersError) {
      console.error('❌ Error fetching orders for admin stats:', ordersError);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    console.log(`📊 Órdenes encontradas: ${orders?.length || 0}`);
    
    // Obtener todos los usuarios
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id');
    
    if (usersError) {
      console.error('❌ Error fetching users for admin stats:', usersError);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    console.log(`👥 Usuarios encontrados: ${users?.length || 0}`);
    
    // Calcular estadísticas generales
    const totalOrders = orders?.length || 0;
    const totalSales = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    const activeCustomers = new Set(orders?.map(order => order.user_id).filter(id => id)).size || 0;
    
    console.log(`💰 Ventas totales: $${totalSales}`);
    console.log(`📦 Total órdenes: ${totalOrders}`);
    console.log(`👥 Clientes activos: ${activeCustomers}`);
    
    // Estadísticas mensuales de ventas (simplificado)
    const monthlySales = [
      { month: '2025-10', totalSales: totalSales, ordersCount: totalOrders }
    ];
    
    // Productos más vendidos (simulado)
    const topProducts = [
      { name: 'Manzanas Gala', category: 'Frutas', totalSold: 15, totalRevenue: 37.35 },
      { name: 'Leche Entera', category: 'Lácteos', totalSold: 12, totalRevenue: 14.40 },
      { name: 'Pan Integral', category: 'Panadería', totalSold: 10, totalRevenue: 21.00 }
    ];
    
    const response = {
      totalSales,
      totalOrders,
      activeCustomers,
      avgOrderValue,
      monthlySales,
      topProducts
    };
    
    console.log('✅ Estadísticas calculadas:', response);
    res.json(response);
  } catch (error) {
    console.error('❌ Error en admin stats:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Supabase escuchando en http://localhost:${PORT}`);
  console.log(`📊 Base de datos: Supabase PostgreSQL`);
});