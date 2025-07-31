# Backend - Sistema de Inventario ERP

Este es el backend del sistema de inventario ERP desarrollado con Node.js, Express y MySQL.

## 🚀 Tecnologías Utilizadas

- **Node.js** - Entorno de ejecución de JavaScript
- **Express.js** - Framework web para Node.js
- **MySQL** - Base de datos relacional
- **mysql2** - Driver de MySQL para Node.js con soporte para promesas
- **dotenv** - Manejo de variables de entorno
- **cors** - Middleware para manejo de CORS
- **nodemon** - Herramienta para desarrollo que reinicia automáticamente el servidor

## 📁 Estructura del Proyecto

```
backend/
├── package.json          # Dependencias y scripts del proyecto
├── server.js             # Punto de entrada del servidor
├── .env                  # Variables de entorno (crear este archivo)
└── src/
    ├── app.js            # Configuración principal de Express
    ├── config/
    │   └── db.js         # Configuración de la base de datos
    ├── controllers/      # Controladores de las rutas
    │   └── testController.js
    ├── middlewares/      # Middlewares personalizados
    ├── models/           # Modelos de datos
    ├── routes/           # Definición de rutas
    │   └── testRoutes.js
    ├── services/         # Lógica de negocio
    └── utils/            # Utilidades y helpers
```

## ⚙️ Configuración e Instalación

### Prerrequisitos

- **Node.js** (versión 14 o superior)
- **npm** o **yarn**
- **MySQL** (versión 5.7 o superior)

### 1. Instalar Dependencias

```bash
cd backend
npm install
```

### 2. Configurar Variables de Entorno

Crear un archivo `.env` en la raíz del directorio backend con la siguiente configuración:

```env
# Configuración del servidor
PORT=3000

# Configuración de la base de datos
DB_HOST=localhost
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=inventario_erp

# Configuración adicional (opcional)
NODE_ENV=development
```

### 3. Configurar Base de Datos

1. **Crear la base de datos en MySQL:**

```sql
CREATE DATABASE inventario_erp;
USE inventario_erp;
```

2. **Verificar la conexión:**
   El proyecto incluye una ruta de prueba para verificar la conexión a la base de datos.

### 4. Ejecutar el Proyecto

#### Modo Desarrollo (con nodemon)
```bash
npm run dev
```

#### Modo Producción
```bash
npm start
```

El servidor se ejecutará en `http://localhost:3000` (o el puerto configurado en tu archivo `.env`).

## 🔧 Scripts Disponibles

- `npm start` - Ejecuta el servidor en modo producción
- `npm run dev` - Ejecuta el servidor en modo desarrollo con nodemon
- `npm test` - Ejecuta las pruebas (por configurar)

## 🌐 Endpoints Disponibles

### Test de Conexión
- **GET** `/api/test` - Verifica la conexión a la base de datos
  - **Respuesta exitosa:** `{ "resultado": 2 }`
  - **Respuesta de error:** `{ "error": "Error al conectar con la base de datos" }`

## 📝 Desarrollo

### Agregar Nuevas Rutas

1. **Crear el controlador** en `src/controllers/`
2. **Definir las rutas** en `src/routes/`
3. **Registrar las rutas** en `src/app.js`

Ejemplo:

```javascript
// En src/app.js
const nuevasRutas = require('./routes/nuevasRutas');
app.use('/api/nuevas', nuevasRutas);
```

### Estructura de Archivos Recomendada

- **Controllers:** Lógica de manejo de peticiones HTTP
- **Models:** Definición de esquemas y modelos de datos
- **Services:** Lógica de negocio y operaciones complejas
- **Routes:** Definición de endpoints y middlewares específicos
- **Middlewares:** Funciones que se ejecutan antes de los controladores
- **Utils:** Funciones auxiliares y utilidades

## 🔒 Configuración de Seguridad

### Variables de Entorno
- Nunca subir el archivo `.env` al repositorio
- Usar variables de entorno para datos sensibles
- Crear un archivo `.env.example` con la estructura sin valores reales

### Base de Datos
- Usar conexiones con pool para mejor rendimiento
- Implementar prepared statements para prevenir SQL injection
- Configurar timeouts y límites de conexión

## 🐛 Solución de Problemas

### Error de Conexión a MySQL
1. Verificar que MySQL esté ejecutándose
2. Comprobar las credenciales en el archivo `.env`
3. Asegurar que la base de datos existe
4. Verificar permisos del usuario de MySQL

### Puerto en Uso
```bash
# Encontrar el proceso que usa el puerto
lsof -ti:3000

# Matar el proceso
kill -9 <PID>
```

### Dependencias
```bash
# Limpiar cache de npm
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

## 📚 Recursos Adicionales

- [Documentación de Express.js](https://expressjs.com/)
- [Documentación de MySQL2](https://www.npmjs.com/package/mysql2)
- [Guía de mejores prácticas de Node.js](https://nodejs.org/en/docs/guides/)

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir un Pull Request

## 📄 Licencia

ISC
