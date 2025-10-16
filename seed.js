const { db, migrate } = require('./db');

migrate();

// Limpiar datos
db.exec(`
  DELETE FROM order_items;
  DELETE FROM orders;
  DELETE FROM products;
`);

const products = [
  {
    name: 'Manzanas Gala (1 kg)',
    description: 'Manzana fresca y crujiente, ideal para snacks.',
    price: 2.49,
    image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800',
    stock: 120,
    category: 'Frutas',
    isEco: 1
  },
  {
    name: 'Bananas (1 kg)',
    description: 'Banana dulce y madura, perfecta para batidos.',
    price: 1.89,
    image: 'https://images.unsplash.com/photo-1571772805064-207c8435df79?w=800',
    stock: 150,
    category: 'Frutas',
    isEco: 1
  },
  {
    name: 'Naranjas Valencia (1 kg)',
    description: 'Naranjas jugosas y dulces, ricas en vitamina C.',
    price: 2.99,
    image: 'https://images.unsplash.com/photo-1557800634-7bf3c73be389?w=800',
    stock: 80,
    category: 'Frutas',
    isEco: 1
  },
  {
    name: 'Fresas frescas (500g)',
    description: 'Fresas rojas y dulces, perfectas para postres.',
    price: 4.50,
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800',
    stock: 60,
    category: 'Frutas',
    isEco: 1
  },
  {
    name: 'Uvas verdes (1 kg)',
    description: 'Uvas crujientes y dulces, snack saludable.',
    price: 3.99,
    image: 'https://images.unsplash.com/photo-1537640538966-79f369143aa8?w=800',
    stock: 45,
    category: 'Frutas',
    isEco: 0
  },
  {
    name: 'Leche Entera 1L',
    description: 'Leche entera UHT de alta calidad.',
    price: 1.20,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
    stock: 80,
    category: 'Lácteos',
    isEco: 0
  },
  {
    name: 'Queso Cheddar (200g)',
    description: 'Queso cheddar madurado, perfecto para sandwiches.',
    price: 3.50,
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800',
    stock: 70,
    category: 'Lácteos',
    isEco: 0
  },
  {
    name: 'Yogurt Griego (500g)',
    description: 'Yogurt griego natural, rico en proteínas.',
    price: 2.80,
    image: 'https://images.unsplash.com/photo-1571212515419-8a4b4a0b0b0b?w=800',
    stock: 90,
    category: 'Lácteos',
    isEco: 1
  },
  {
    name: 'Mantequilla (250g)',
    description: 'Mantequilla fresca de vaca, ideal para cocinar.',
    price: 2.20,
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800',
    stock: 55,
    category: 'Lácteos',
    isEco: 0
  },
  {
    name: 'Pan de molde integral',
    description: 'Pan integral suave, 20 rebanadas.',
    price: 2.10,
    image: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=800',
    stock: 60,
    category: 'Panadería',
    isEco: 1
  },
  {
    name: 'Croissants (6 unidades)',
    description: 'Croissants horneados frescos, perfectos para desayuno.',
    price: 4.20,
    image: 'https://images.unsplash.com/photo-1555507036-ab1a403d5a4a?w=800',
    stock: 40,
    category: 'Panadería',
    isEco: 0
  },
  {
    name: 'Bagels de sésamo (4 unidades)',
    description: 'Bagels artesanales con semillas de sésamo.',
    price: 3.80,
    image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=800',
    stock: 35,
    category: 'Panadería',
    isEco: 1
  },
  {
    name: 'Huevos camperos (12u)',
    description: 'Huevos de gallinas camperas, tamaño L.',
    price: 3.40,
    image: 'https://images.unsplash.com/photo-1517959105821-eaf2591984dd?w=800',
    stock: 70,
    category: 'Huevos',
    isEco: 1
  },
  {
    name: 'Huevos orgánicos (6u)',
    description: 'Huevos orgánicos de gallinas libres.',
    price: 2.80,
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800',
    stock: 50,
    category: 'Huevos',
    isEco: 1
  },
  {
    name: 'Café molido 500g',
    description: 'Tueste medio, aroma intenso.',
    price: 5.90,
    image: 'https://images.unsplash.com/photo-1509401934319-c03c42e1c88b?w=800',
    stock: 40,
    category: 'Bebidas',
    isEco: 1
  },
  {
    name: 'Té verde (100 bolsitas)',
    description: 'Té verde premium, antioxidantes naturales.',
    price: 4.50,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800',
    stock: 65,
    category: 'Bebidas',
    isEco: 1
  },
  {
    name: 'Agua mineral (6 botellas)',
    description: 'Agua mineral natural, 1.5L por botella.',
    price: 3.20,
    image: 'https://images.unsplash.com/photo-1548839140-5d6a4c8b8b8b?w=800',
    stock: 100,
    category: 'Bebidas',
    isEco: 0
  },
  {
    name: 'Jugo de naranja (1L)',
    description: 'Jugo de naranja 100% natural, sin conservantes.',
    price: 2.80,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800',
    stock: 75,
    category: 'Bebidas',
    isEco: 1
  }
];

const insert = db.prepare(`
  INSERT INTO products (name, description, price, image, stock, category, isEco)
  VALUES (@name, @description, @price, @image, @stock, @category, @isEco)
`);
const insertMany = db.transaction((rows) => {
  for (const p of rows) insert.run(p);
});

insertMany(products);

console.log(`Seed completado: ${products.length} productos creados.`);


