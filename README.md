# 🛒 SuperMercado - Aplicación Web de Delivery

Una aplicación web completa de supermercado con funcionalidades de e-commerce, panel de administración y sistema de autenticación.

## ✨ Características

### 🛍️ Frontend
- **Interfaz moderna**: Diseño responsive con modo nocturno y ecológico
- **Catálogo de productos**: 18 productos organizados por categorías
- **Carrito de compras**: Funcionalidad completa de agregar/quitar productos
- **Búsqueda**: Filtrado por nombre y categoría
- **Modos de visualización**: 
  - 🌙 Modo nocturno
  - 🌱 Modo ecológico (destaca productos eco-friendly)

### 🔐 Autenticación
- **Login/Registro**: Sistema de autenticación con tabs dinámicos
- **Acceso administrativo**: Panel restringido para administradores
- **Credenciales admin**: `admin@gmail.com` / `admin1234`

### 🛠️ Panel de Administración
- **Gestión de productos**: Crear, editar, eliminar productos
- **Búsqueda avanzada**: Filtrar por nombre y categoría
- **Clasificación ecológica**: Marcar productos como eco-friendly
- **Inventario**: Control de stock y precios

### 🗄️ Backend
- **API RESTful**: Endpoints para productos y órdenes
- **Base de datos SQLite**: Almacenamiento local con `better-sqlite3`
- **Servidor Express**: API robusta y escalable

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js (versión 14 o superior)
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/johan12rojas/supermercado.git
cd supermercado

# Instalar dependencias
npm install

# Poblar la base de datos con productos de ejemplo
npm run seed

# Iniciar el servidor de desarrollo
npm run dev
```

### Scripts Disponibles
- `npm start`: Inicia el servidor en producción
- `npm run dev`: Inicia el servidor con nodemon (desarrollo)
- `npm run seed`: Pobla la base de datos con productos de ejemplo

## 🌐 Acceso

Una vez iniciado el servidor, la aplicación estará disponible en:
- **Frontend**: http://localhost:3000
- **Panel Admin**: http://localhost:3000/admin.html

## 📁 Estructura del Proyecto

```
supermercado/
├── public/                 # Archivos estáticos del frontend
│   ├── index.html         # Página principal
│   ├── admin.html         # Panel de administración
│   ├── app.js            # Lógica del frontend
│   └── styles.css        # Estilos CSS
├── server.js             # Servidor Express
├── db.js                 # Configuración de base de datos
├── seed.js               # Datos de ejemplo
├── package.json          # Dependencias del proyecto
└── README.md             # Este archivo
```

## 🎨 Tecnologías Utilizadas

### Frontend
- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con variables CSS y responsive design
- **JavaScript ES6+**: Lógica del cliente con async/await

### Backend
- **Node.js**: Runtime de JavaScript
- **Express.js**: Framework web
- **SQLite**: Base de datos local
- **better-sqlite3**: Driver de base de datos

### Características Técnicas
- **Responsive Design**: Adaptable a móviles y tablets
- **Modo Oscuro**: Tema nocturno con colores optimizados
- **Modo Ecológico**: Destacado de productos eco-friendly
- **Local Storage**: Persistencia de carrito y preferencias
- **API RESTful**: Endpoints bien estructurados

## 🔧 Funcionalidades Detalladas

### Sistema de Productos
- **18 productos** distribuidos en 6 categorías
- **Imágenes reales** de Unsplash
- **Clasificación ecológica** con badges especiales
- **Control de stock** y precios

### Carrito de Compras
- **Persistencia local**: Se mantiene entre sesiones
- **Cantidades dinámicas**: Añadir/quitar productos
- **Cálculo automático**: Total dinámico
- **Checkout simulado**: Proceso de compra completo

### Panel de Administración
- **CRUD completo**: Crear, leer, actualizar, eliminar productos
- **Búsqueda en tiempo real**: Por nombre y categoría
- **Validación de formularios**: Campos obligatorios
- **Interfaz intuitiva**: Diseño profesional

## 🌱 Modo Ecológico

El modo ecológico activa:
- **Paleta de colores verde**: Tema ambiental
- **Badges especiales**: 🌿 Eco en productos eco-friendly
- **Filtrado visual**: Destacado de productos sostenibles

## 🌙 Modo Nocturno

El modo nocturno incluye:
- **Colores oscuros**: Fondo y elementos adaptados
- **Contraste optimizado**: Legibilidad mejorada
- **Imagen del hero**: Menos oscura para mejor visibilidad
- **Transiciones suaves**: Cambios elegantes entre modos

## 📱 Responsive Design

La aplicación es completamente responsive:
- **Mobile First**: Optimizada para móviles
- **Breakpoints**: Adaptación a tablets y desktop
- **Grid flexible**: Layouts que se adaptan al contenido
- **Touch friendly**: Botones y elementos táctiles

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo `package.json` para más detalles.

## 👨‍💻 Autor

**Johan Rojas**
- GitHub: [@johan12rojas](https://github.com/johan12rojas)
- Repositorio: [supermercado](https://github.com/johan12rojas/supermercado)

---

¡Disfruta usando SuperMercado! 🛒✨