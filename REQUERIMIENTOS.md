# 📋 REQUERIMIENTOS DEL SISTEMA ECOMARKET

## 🎯 RESUMEN EJECUTIVO

EcoMarket es una aplicación web de supermercado online desarrollada como proyecto universitario. Permite a los usuarios realizar compras de productos de manera digital, con funcionalidades de administración para gestionar inventario, pedidos y estadísticas. El sistema está diseñado con un enfoque ecológico y sostenible, demostrando competencias en desarrollo web full-stack.

---

## 🔧 REQUERIMIENTOS FUNCIONALES

### 📱 **MÓDULO DE USUARIO**

#### **RF-001: Gestión de Productos**
- **RF-001.1**: El sistema debe permitir visualizar todos los productos disponibles
- **RF-001.2**: El sistema debe permitir filtrar productos por categorías (Frutas, Lácteos, Carnes, Panadería, etc.)
- **RF-001.3**: El sistema debe mostrar información detallada de cada producto (nombre, precio, imagen, stock, descripción)
- **RF-001.4**: El sistema debe identificar productos ecológicos con indicadores visuales especiales
- **RF-001.5**: El sistema debe mostrar el estado del stock (disponible, stock bajo, agotado)

#### **RF-002: Gestión del Carrito de Compras**
- **RF-002.1**: El sistema debe permitir agregar productos al carrito
- **RF-002.2**: El sistema debe permitir modificar cantidades de productos en el carrito
- **RF-002.3**: El sistema debe permitir eliminar productos del carrito
- **RF-002.4**: El sistema debe calcular automáticamente el total del carrito
- **RF-002.5**: El sistema debe mantener el carrito durante la sesión del usuario
- **RF-002.6**: El sistema debe validar disponibilidad de stock antes de agregar al carrito

#### **RF-003: Proceso de Checkout**
- **RF-003.1**: El sistema debe permitir completar pedidos en 3 pasos:
  - Paso 1: Información de dirección y contacto
  - Paso 2: Selección de método de entrega
  - Paso 3: Selección de método de pago
- **RF-003.2**: El sistema debe validar información requerida en cada paso
- **RF-003.3**: El sistema debe calcular costos de envío según método seleccionado
- **RF-003.4**: El sistema debe mostrar resumen detallado del pedido
- **RF-003.5**: El sistema debe permitir navegación entre pasos del checkout

#### **RF-004: Gestión de Pedidos**
- **RF-004.1**: El sistema debe permitir visualizar historial de pedidos del usuario
- **RF-004.2**: El sistema debe mostrar estado de cada pedido (pendiente, en proceso, completado)
- **RF-004.3**: El sistema debe mostrar detalles completos de cada pedido
- **RF-004.4**: El sistema debe permitir eliminar pedidos del historial (soft delete)

#### **RF-005: Perfil de Usuario**
- **RF-005.1**: El sistema debe mostrar estadísticas del usuario (total gastado, pedidos realizados)
- **RF-005.2**: El sistema debe permitir visualizar información de contacto del usuario
- **RF-005.3**: El sistema debe mostrar resumen de gastos por categorías

### ⚙️ **MÓDULO DE ADMINISTRACIÓN**

#### **RF-006: Gestión de Productos (Admin)**
- **RF-006.1**: El sistema debe permitir crear nuevos productos
- **RF-006.2**: El sistema debe permitir editar información de productos existentes
- **RF-006.3**: El sistema debe permitir eliminar productos
- **RF-006.4**: El sistema debe permitir actualizar stock de productos
- **RF-006.5**: El sistema debe permitir marcar productos como ecológicos
- **RF-006.6**: El sistema debe validar datos de productos antes de guardar

#### **RF-007: Gestión de Pedidos (Admin)**
- **RF-007.1**: El sistema debe permitir visualizar todos los pedidos
- **RF-007.2**: El sistema debe permitir cambiar estado de pedidos
- **RF-007.3**: El sistema debe permitir eliminar pedidos (soft delete)
- **RF-007.4**: El sistema debe mostrar detalles completos de cada pedido

#### **RF-008: Estadísticas y Reportes**
- **RF-008.1**: El sistema debe mostrar estadísticas generales (productos vendidos, ingresos totales)
- **RF-008.2**: El sistema debe mostrar resumen de stock por niveles
- **RF-008.3**: El sistema debe mostrar número de pedidos completados
- **RF-008.4**: El sistema debe mostrar productos con stock bajo o agotado

#### **RF-009: Monitoreo de Stock**
- **RF-009.1**: El sistema debe mostrar indicadores visuales de stock
- **RF-009.2**: El sistema debe categorizar productos por nivel de stock:
  - Sin stock (rojo)
  - Stock bajo (naranja)
  - Stock medio (azul)
  - Stock alto (verde)
- **RF-009.3**: El sistema debe mostrar resumen numérico de cada categoría de stock

---

## 🚀 REQUERIMIENTOS NO FUNCIONALES

### 📊 **RENDIMIENTO**

#### **RNF-001: Tiempo de Respuesta**
- **RNF-001.1**: Las páginas deben cargar en menos de 3 segundos
- **RNF-001.2**: Las operaciones de base de datos deben completarse en menos de 1 segundo

### 🔒 **SEGURIDAD**

#### **RNF-003: Protección de Datos**
- **RNF-003.1**: Los datos de usuarios deben estar protegidos
- **RNF-003.2**: El sistema debe validar todas las entradas del usuario
- **RNF-003.3**: Los pedidos eliminados deben mantenerse en base de datos (soft delete)
- **RNF-003.4**: El sistema debe prevenir inyección SQL

#### **RNF-004: Autenticación**
- **RNF-004.1**: El sistema debe diferenciar entre usuarios normales y administradores
- **RNF-004.2**: Las funciones administrativas deben estar protegidas

### 🎨 **USABILIDAD**

#### **RNF-005: Interfaz de Usuario**
- **RNF-005.1**: La interfaz debe ser intuitiva y fácil de usar
- **RNF-005.2**: El sistema debe ser responsive (adaptable a móviles y tablets)
- **RNF-005.3**: Los elementos ecológicos deben tener indicadores visuales claros
- **RNF-005.4**: El sistema debe tener un diseño consistente y profesional

#### **RNF-006: Accesibilidad**
- **RNF-006.1**: Los colores deben tener suficiente contraste
- **RNF-006.2**: Los elementos interactivos deben ser fácilmente identificables

### 🔧 **MANTENIBILIDAD**

#### **RNF-007: Código**
- **RNF-007.1**: El código debe estar bien documentado
- **RNF-007.2**: El sistema debe usar tecnologías estándar y mantenibles
- **RNF-007.3**: La arquitectura debe permitir fácil modificación y extensión

#### **RNF-008: Base de Datos**
- **RNF-008.1**: Los datos deben poder restaurarse fácilmente
- **RNF-008.2**: El sistema debe incluir datos de prueba (seed data)

### 🌐 **COMPATIBILIDAD**

#### **RNF-009: Navegadores**
- **RNF-009.1**: El sistema debe funcionar en Chrome, Firefox, Safari y Edge
- **RNF-009.2**: El sistema debe ser compatible con versiones recientes de navegadores

#### **RNF-010: Dispositivos**
- **RNF-010.1**: El sistema debe adaptarse a diferentes tamaños de pantalla

---

## 📝 CASOS DE USO INICIALES

### 👤 **ACTOR: CLIENTE**

#### **CU-001: Explorar Productos**
- **Descripción**: El cliente desea ver los productos disponibles en el supermercado
- **Precondiciones**: El cliente accede al sistema
- **Flujo Principal**:
  1. El cliente accede a la página principal
  2. El sistema muestra todos los productos disponibles
  3. El cliente puede filtrar por categorías
  4. El cliente puede ver detalles de productos específicos
- **Flujo Alternativo**: 
  - 3a. Si no hay productos en una categoría, mostrar mensaje informativo
- **Postcondiciones**: El cliente puede ver productos y agregarlos al carrito

#### **CU-002: Agregar Producto al Carrito**
- **Descripción**: El cliente desea agregar un producto a su carrito de compras
- **Precondiciones**: El cliente está viendo productos disponibles
- **Flujo Principal**:
  1. El cliente selecciona un producto
  2. El cliente hace clic en "Agregar al Carrito"
  3. El sistema valida disponibilidad de stock
  4. El sistema agrega el producto al carrito
  5. El sistema actualiza el contador del carrito
- **Flujo Alternativo**:
  - 3a. Si no hay stock disponible, mostrar mensaje de error
- **Postcondiciones**: El producto se agrega al carrito del cliente

#### **CU-003: Realizar Pedido**
- **Descripción**: El cliente desea completar una compra
- **Precondiciones**: El cliente tiene productos en su carrito
- **Flujo Principal**:
  1. El cliente accede al checkout
  2. **Paso 1**: El cliente ingresa información de dirección y contacto
  3. El sistema valida la información
  4. **Paso 2**: El cliente selecciona método de entrega
  5. El sistema calcula costo de envío
  6. **Paso 3**: El cliente selecciona método de pago
  7. El cliente confirma el pedido
  8. El sistema crea el pedido y actualiza stock
- **Flujo Alternativo**:
  - 3a. Si la información es inválida, mostrar errores específicos
  - 7a. Si hay problemas con el pago, permitir reintentar
- **Postcondiciones**: Se crea un nuevo pedido y se reduce el stock

#### **CU-004: Ver Historial de Pedidos**
- **Descripción**: El cliente desea ver sus pedidos anteriores
- **Precondiciones**: El cliente tiene pedidos realizados
- **Flujo Principal**:
  1. El cliente accede a su perfil
  2. El sistema muestra historial de pedidos
  3. El cliente puede ver detalles de cada pedido
  4. El cliente puede eliminar pedidos del historial
- **Postcondiciones**: El cliente puede gestionar su historial de pedidos

### ⚙️ **ACTOR: ADMINISTRADOR**

#### **CU-005: Gestionar Productos**
- **Descripción**: El administrador desea gestionar el catálogo de productos
- **Precondiciones**: El administrador está autenticado
- **Flujo Principal**:
  1. El administrador accede al panel de administración
  2. El administrador selecciona "Gestión de Productos"
  3. El administrador puede:
     - Crear nuevos productos
     - Editar productos existentes
     - Eliminar productos
     - Actualizar stock
- **Flujo Alternativo**:
  - 3a. Si hay errores de validación, mostrar mensajes específicos
- **Postcondiciones**: El catálogo de productos se actualiza

#### **CU-006: Monitorear Stock**
- **Descripción**: El administrador desea monitorear los niveles de stock
- **Precondiciones**: El administrador está autenticado
- **Flujo Principal**:
  1. El administrador accede al panel de administración
  2. El sistema muestra indicadores visuales de stock
  3. El administrador puede ver:
     - Productos sin stock (rojo)
     - Productos con stock bajo (naranja)
     - Productos con stock normal (azul/verde)
  4. El administrador puede ver resumen numérico por categorías
- **Postcondiciones**: El administrador tiene visibilidad completa del stock

#### **CU-007: Gestionar Pedidos**
- **Descripción**: El administrador desea gestionar los pedidos de clientes
- **Precondiciones**: El administrador está autenticado
- **Flujo Principal**:
  1. El administrador accede al panel de administración
  2. El administrador selecciona "Gestión de Pedidos"
  3. El administrador puede:
     - Ver todos los pedidos
     - Cambiar estado de pedidos
     - Ver detalles de pedidos
     - Eliminar pedidos (soft delete)
- **Postcondiciones**: Los pedidos se gestionan correctamente

#### **CU-008: Ver Estadísticas**
- **Descripción**: El administrador desea ver estadísticas del negocio
- **Precondiciones**: El administrador está autenticado
- **Flujo Principal**:
  1. El administrador accede al panel de administración
  2. El sistema muestra estadísticas generales:
     - Productos vendidos
     - Ingresos totales
     - Pedidos completados
     - Productos en stock
  3. El administrador puede ver resumen de stock por niveles
- **Postcondiciones**: El administrador tiene información completa del negocio

---

## 🎯 **CASOS DE USO ESPECIALES**

### 🌱 **CU-009: Modo Ecológico**
- **Descripción**: El sistema debe destacar productos ecológicos
- **Precondiciones**: Existen productos marcados como ecológicos
- **Flujo Principal**:
  1. El sistema identifica productos ecológicos
  2. El sistema aplica indicadores visuales especiales (verde)
  3. Los productos ecológicos se destacan en listados
  4. El sistema puede filtrar solo productos ecológicos
- **Postcondiciones**: Los productos ecológicos son fácilmente identificables

### 🚚 **CU-010: Cálculo de Envío**
- **Descripción**: El sistema debe calcular costos de envío según método seleccionado
- **Precondiciones**: El cliente está en el proceso de checkout
- **Flujo Principal**:
  1. El cliente selecciona método de entrega:
     - Entrega Express: $9.99
     - Entrega Estándar: $4.99
     - Recoger en Tienda: $0.00
  2. El sistema calcula automáticamente el costo
  3. El sistema actualiza el total del pedido
- **Postcondiciones**: El costo de envío se refleja en el total

---

## 📊 **MÉTRICAS DE ÉXITO**

### 🎯 **Métricas Funcionales**
- **Tiempo promedio de checkout**: < 5 minutos
- **Tasa de abandono de carrito**: < 30%
- **Precisión de cálculos**: 100%
- **Disponibilidad de productos**: > 95%

### 📈 **Métricas de Rendimiento**
- **Tiempo de carga de páginas**: < 3 segundos
- **Tiempo de respuesta de API**: < 1 segundo
- **Funcionamiento estable**: Sin errores críticos

### 🔒 **Métricas de Seguridad**
- **Errores de validación**: 0%
- **Pérdida de datos**: 0%
- **Vulnerabilidades críticas**: 0%

---

## 🚀 **ROADMAP FUTURO**

### **Fase 2: Mejoras Académicas**
- Sistema de usuarios y autenticación básica
- Mejoras en la interfaz de usuario
- Optimización de consultas de base de datos
- Documentación técnica completa

### **Fase 3: Funcionalidades Adicionales**
- Sistema de búsqueda avanzada
- Filtros adicionales por precio y características
- Mejoras en el proceso de checkout
- Panel de administración más robusto

### **Fase 4: Presentación Final**
- Pruebas de usuario completas
- Documentación de usuario final
- Presentación del proyecto
- Entrega del código fuente completo

---

*Documento creado para el proyecto EcoMarket - Supermercado Online*
*Versión: 1.0 | Fecha: Diciembre 2024*
