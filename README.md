# Impresiones Low Cost - Frontend

Aplicación React para gestión de pedidos de impresión.

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Layout.jsx      # Layout principal con Navbar
│   ├── Navbar.jsx      # Barra de navegación
│   └── ProtectedRoute.jsx  # Componente para proteger rutas
├── pages/              # Páginas de la aplicación
│   ├── Login.jsx       # Página de inicio de sesión
│   ├── Register.jsx    # Página de registro
│   ├── Dashboard.jsx   # Panel principal
│   ├── NuevoPedido.jsx # Crear nuevo pedido
│   ├── Historial.jsx   # Historial de pedidos
│   ├── DetallePedido.jsx # Detalle de un pedido
│   ├── Configuracion.jsx # Configuración de usuario
│   ├── Admin.jsx       # Panel de administración
│   └── PedidoConfirmado.jsx # Confirmación de pedido
├── context/            # Contextos de React
│   └── AuthContext.jsx # Contexto de autenticación
├── services/           # Servicios
│   └── api.js          # Configuración de Axios
└── styles/             # Estilos
    └── index.css       # Estilos globales con Tailwind
```

## Rutas de la Aplicación

- `/login` - Inicio de sesión
- `/register` - Registro de usuario
- `/dashboard` - Panel principal (protegida)
- `/nuevo-pedido` - Crear nuevo pedido (protegida)
- `/historial` - Historial de pedidos (protegida)
- `/configuracion` - Configuración de usuario (protegida)
- `/pedido/:id` - Detalle de pedido (protegida)
- `/admin` - Panel de administración (protegida, solo admin)
- `/pedido-confirmado` - Confirmación de pedido (protegida)

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Crear archivo `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

3. Ejecutar en desarrollo:
```bash
npm run dev
```

4. Construir para producción:
```bash
npm run build
```

## Tecnologías Utilizadas

- React 18.3.1
- React Router DOM 7.5.3
- Axios 1.7.9
- Tailwind CSS 3.4.17
- React Icons 5.3.0
- Vite 6.0.7

## Componentes Principales

### Navbar
Barra de navegación fija en la parte inferior (móvil) o superior (desktop) con enlaces a:
- Inicio (Dashboard)
- Nuevo Pedido
- Historial
- Perfil (Configuración)

### Layout
Wrapper que incluye el Navbar y el contenido de las páginas protegidas.

### ProtectedRoute
Componente que protege rutas requiriendo autenticación. Opcionalmente puede requerir rol de administrador.

## Hooks y Contextos

### AuthContext
Proporciona:
- `auth`: Usuario autenticado actual
- `login(email, password)`: Iniciar sesión
- `register(userData)`: Registrarse
- `logout()`: Cerrar sesión
- `loading`: Estado de carga

## Servicios API

El servicio `api.js` configura Axios con:
- URL base configurable
- Interceptor para agregar token de autenticación
- Interceptor para manejar errores 401 (no autorizado)

## Despliegue en Vercel

### Pasos para desplegar:

1. **Preparar el repositorio:**
   - Asegúrate de que todos los cambios estén commitados
   - Sube el código a GitHub, GitLab o Bitbucket

2. **Conectar con Vercel:**
   - Ve a [vercel.com](https://vercel.com) e inicia sesión
   - Haz clic en "Add New Project"
   - Importa tu repositorio

3. **Configurar variables de entorno:**
   - En la configuración del proyecto, ve a "Environment Variables"
   - Agrega la variable: `VITE_API_URL` con la URL de tu backend en Render
     - Ejemplo: `https://tu-backend.onrender.com/api`
   - Asegúrate de agregarla para Production, Preview y Development

4. **Configuración del proyecto:**
   - Framework Preset: Vite (se detecta automáticamente)
   - Build Command: `npm run build` (ya configurado en vercel.json)
   - Output Directory: `dist` (ya configurado en vercel.json)
   - Install Command: `npm install` (por defecto)

5. **Desplegar:**
   - Haz clic en "Deploy"
   - Vercel construirá y desplegará tu aplicación automáticamente

### Configuración importante:

- El archivo `vercel.json` ya está configurado con las redirecciones necesarias para React Router
- Todas las rutas se redirigen a `index.html` para que React Router funcione correctamente
- Las variables de entorno deben tener el prefijo `VITE_` para que Vite las incluya en el build

### URL del backend:

Asegúrate de que la variable `VITE_API_URL` apunte a la URL completa de tu backend en Render, incluyendo el prefijo `/api` si es necesario.

Ejemplo:
```
VITE_API_URL=https://impresiones-backend.onrender.com/api
```

## Notas

- El proyecto usa Tailwind CSS para estilos
- Las rutas están protegidas con autenticación
- El panel de administración requiere rol de admin
- Los archivos se suben usando FormData multipart
- El proyecto está configurado para despliegue en Vercel con soporte completo para React Router

