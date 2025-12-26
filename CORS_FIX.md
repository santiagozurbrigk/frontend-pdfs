# Solución de Error CORS - Configuración del Backend

## Problema

El frontend desplegado en Vercel (`https://frontend-pdfs.vercel.app`) no puede comunicarse con el backend en Render (`https://backend-lowcostapp.onrender.com`) debido a políticas CORS.

## Solución: Configurar CORS en el Backend

Necesitas actualizar la configuración de CORS en tu backend para permitir requests desde el dominio de Vercel.

### Opción 1: Usando el paquete `cors` de Express (Recomendado)

Si tu backend usa Express.js con el paquete `cors`, actualiza la configuración así:

**Archivo:** `index.js` o donde configures tu servidor Express

```javascript
const cors = require('cors');

// Configuración de CORS
const corsOptions = {
  origin: [
    'http://localhost:3000', // Desarrollo local
    'http://localhost:5173',  // Vite dev server
    'https://frontend-pdfs.vercel.app', // Producción Vercel
    // Puedes agregar más dominios aquí si es necesario
  ],
  credentials: true, // Permite cookies y headers de autenticación
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
```

### Opción 2: Configuración manual de CORS

Si no usas el paquete `cors`, puedes configurarlo manualmente:

```javascript
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://frontend-pdfs.vercel.app',
  ];

  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});
```

### Opción 3: Permitir todos los orígenes (Solo para desarrollo/testing)

⚠️ **NO recomendado para producción**, pero útil para testing:

```javascript
const cors = require('cors');

app.use(cors({
  origin: '*', // Permite todos los orígenes
  credentials: true,
}));
```

## Pasos para Aplicar la Solución

1. **Clonar o acceder al repositorio del backend:**
   ```bash
   git clone https://github.com/santiagozurbrigk/Backend-lowcostapp.git
   cd Backend-lowcostapp
   ```

2. **Localizar el archivo de configuración del servidor:**
   - Busca `index.js` o `server.js` en la raíz del proyecto
   - Busca donde se configura Express y CORS

3. **Actualizar la configuración de CORS:**
   - Agrega `https://frontend-pdfs.vercel.app` a la lista de orígenes permitidos
   - Asegúrate de incluir `credentials: true` si usas autenticación con tokens

4. **Instalar el paquete cors si no lo tienes:**
   ```bash
   npm install cors
   ```

5. **Commitear y pushear los cambios:**
   ```bash
   git add .
   git commit -m "Configurar CORS para permitir requests desde Vercel"
   git push origin main
   ```

6. **Esperar a que Render redespliegue automáticamente:**
   - Render detectará los cambios y redesplegará automáticamente
   - Esto puede tomar 2-5 minutos

7. **Verificar que funciona:**
   - Intenta iniciar sesión desde tu frontend en Vercel
   - Revisa la consola del navegador para confirmar que no hay errores CORS

## Verificación

Después de aplicar los cambios, deberías poder:

1. ✅ Hacer login desde `https://frontend-pdfs.vercel.app`
2. ✅ Realizar peticiones al backend sin errores CORS
3. ✅ Ver las respuestas del backend en la consola del navegador

## URLs Importantes

- **Frontend (Vercel):** `https://frontend-pdfs.vercel.app`
- **Backend (Render):** `https://backend-lowcostapp.onrender.com`
- **Repositorio Backend:** `https://github.com/santiagozurbrigk/Backend-lowcostapp`

## Notas Adicionales

- Si tienes múltiples dominios de Vercel (preview deployments), puedes usar un patrón:
  ```javascript
  origin: function (origin, callback) {
    if (!origin || origin.includes('vercel.app') || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
  ```

- Asegúrate de que `credentials: true` esté configurado si usas cookies o tokens de autenticación
- Los headers `Content-Type` y `Authorization` deben estar en `allowedHeaders`

## Si el Problema Persiste

1. Verifica que el backend se haya redesplegado correctamente en Render
2. Limpia la caché del navegador (Ctrl+Shift+R o Cmd+Shift+R)
3. Verifica que la URL del backend en Vercel sea correcta (`VITE_API_URL`)
4. Revisa los logs del backend en Render para ver si hay errores

