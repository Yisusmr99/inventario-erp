# 📦 Sistema de Inventario ERP

Un sistema completo de gestión de inventario desarrollado como monorepo con arquitectura moderna, separando el backend y frontend para una mejor escalabilidad y mantenimiento.

## 🏗️ Arquitectura del Proyecto

Este es un monorepo que contiene:

- **Backend**: API RESTful desarrollada con Node.js y Express
- **Frontend**: Aplicación web desarrollada con React Router v7 y TypeScript

```
inventario-erp/
├── backend/              # API RESTful - Node.js + Express + MySQL
│   ├── src/
│   │   ├── config/       # Configuración de base de datos
│   │   ├── controllers/  # Controladores de rutas
│   │   ├── middlewares/  # Middlewares personalizados
│   │   ├── models/       # Modelos de datos
│   │   ├── routes/       # Definición de rutas API
│   │   ├── services/     # Lógica de negocio
│   │   └── utils/        # Utilidades y helpers
│   ├── package.json
│   └── server.js         # Punto de entrada del servidor
│
├── frontend/             # Aplicación web - React Router + TypeScript
│   ├── app/
│   │   ├── routes/       # Páginas de la aplicación
│   │   ├── welcome/      # Componente de bienvenida
│   │   └── test/         # Componentes de prueba
│   ├── public/           # Archivos estáticos
│   ├── package.json
│   └── vite.config.ts    # Configuración de Vite
│
└── README.md             # Este archivo
```

## 🚀 Tecnologías Utilizadas

### Backend
- **Node.js** - Entorno de ejecución de JavaScript
- **Express.js** - Framework web para Node.js
- **MySQL** - Base de datos relacional
- **mysql2** - Driver de MySQL con soporte para promesas
- **dotenv** - Manejo de variables de entorno
- **cors** - Middleware para manejo de CORS
- **nodemon** - Herramienta de desarrollo

### Frontend
- **React** v19 - Biblioteca de UI
- **React Router** v7 - Enrutamiento con SSR
- **TypeScript** - Tipado estático
- **Vite** - Herramienta de build y desarrollo
- **TailwindCSS** v4 - Framework de CSS
- **Hot Module Replacement (HMR)** - Recarga en caliente

## ⚙️ Requisitos Previos

- **Node.js** (versión 18 o superior)
- **npm** o **yarn**
- **MySQL** (versión 8.0 o superior)
- **Git**

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd inventario-erp
```

### 2. Configurar el Backend

```bash
cd backend
npm install
```

#### Configurar variables de entorno
Crear archivo `.env` en la carpeta `backend`:

```env
PORT=3000
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=inventario_erp
```

#### Iniciar el servidor de desarrollo
```bash
npm run dev
```

El backend estará disponible en: `http://localhost:3000`

### 3. Configurar el Frontend

```bash
cd frontend
npm install
```

#### Iniciar la aplicación en modo desarrollo
```bash
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

## 🚀 Scripts Disponibles

### Backend (`/backend`)

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el servidor en modo producción |
| `npm run dev` | Inicia el servidor en modo desarrollo con nodemon |
| `npm test` | Ejecuta las pruebas (pendiente de implementar) |

### Frontend (`/frontend`)

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo con HMR |
| `npm run build` | Construye la aplicación para producción |
| `npm start` | Sirve la aplicación construida |
| `npm run typecheck` | Verifica los tipos de TypeScript |

## 🏃‍♂️ Inicio Rápido

Para levantar todo el sistema completo:

1. **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Acceder a la aplicación:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 📚 Endpoints de la API

### Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/test` | Prueba de conexión a la base de datos |

*Más endpoints serán agregados conforme se desarrolle el sistema.*

## 🗄️ Base de Datos

El sistema utiliza MySQL como base de datos principal. Asegúrate de:

1. Tener MySQL instalado y corriendo
2. Crear la base de datos `inventario_erp`
3. Configurar las credenciales en el archivo `.env` del backend

## 🔧 Desarrollo

### Estructura de Carpetas del Backend

- `controllers/` - Lógica de los controladores
- `routes/` - Definición de rutas de la API
- `models/` - Modelos de datos y esquemas
- `services/` - Lógica de negocio
- `middlewares/` - Middlewares personalizados
- `config/` - Configuración de la aplicación
- `utils/` - Funciones utilitarias

### Estructura de Carpetas del Frontend

- `app/routes/` - Páginas y rutas de la aplicación
- `app/components/` - Componentes reutilizables (pendiente)
- `public/` - Archivos estáticos
- `app/styles/` - Archivos de estilos (pendiente)

## 🚀 Despliegue

### Backend
- Configurar variables de entorno en el servidor
- Ejecutar `npm start` para modo producción
- Asegurar que MySQL esté disponible

### Frontend
```bash
cd frontend
npm run build
npm start
```

### Docker (Opcional)
El frontend incluye un `Dockerfile` para despliegue en contenedores.

## 🤝 Contribución

1. Fork del repositorio
2. Crear una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Si tienes algún problema o pregunta, por favor:

1. Revisa la documentación existente
2. Busca en los issues existentes
3. Crea un nuevo issue si es necesario

---

**Desarrollado con ❤️ para el análisis y gestión de inventarios**
