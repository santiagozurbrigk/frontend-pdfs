# Guía de Despliegue en Vercel

Esta guía te ayudará a desplegar el frontend de Impresiones Low Cost en Vercel.

## Prerrequisitos

- ✅ Cuenta en Vercel (gratis en [vercel.com](https://vercel.com))
- ✅ Repositorio Git (GitHub, GitLab o Bitbucket)
- ✅ Backend desplegado en Render (o tu servicio preferido)
- ✅ URL del backend disponible

## Pasos para Desplegar

### 1. Preparar el Repositorio

Asegúrate de que todos los archivos estén commitados y subidos a tu repositorio:

```bash
git add .
git commit -m "Preparar para despliegue en Vercel"
git push origin main
```

### 2. Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión con GitHub/GitLab/Bitbucket
2. Haz clic en **"Add New Project"** o **"Import Project"**
3. Selecciona tu repositorio del frontend
4. Vercel detectará automáticamente que es un proyecto Vite

### 3. Configurar Variables de Entorno

**IMPORTANTE:** Debes configurar la variable de entorno antes de desplegar:

1. En la página de configuración del proyecto, busca **"Environment Variables"**
2. Agrega la siguiente variable:
   - **Name:** `VITE_API_URL`
   - **Value:** La URL completa de tu backend en Render
     - Ejemplo: `https://impresiones-backend.onrender.com/api`
   - **Environment:** Selecciona las tres opciones:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

**Nota:** La URL debe incluir el protocolo `https://` y el prefijo `/api` si tu backend lo requiere.

### 4. Configuración del Proyecto

Vercel debería detectar automáticamente la configuración, pero verifica:

- **Framework Preset:** Vite
- **Build Command:** `npm run build` (ya configurado en `vercel.json`)
- **Output Directory:** `dist` (ya configurado en `vercel.json`)
- **Install Command:** `npm install` (por defecto)

### 5. Desplegar

1. Haz clic en **"Deploy"**
2. Espera a que Vercel construya tu proyecto (toma 1-2 minutos)
3. Una vez completado, recibirás una URL de producción

### 6. Verificar el Despliegue

1. Abre la URL proporcionada por Vercel
2. Verifica que la aplicación carga correctamente
3. Prueba hacer login y verificar que las peticiones al backend funcionan
4. Revisa la consola del navegador por posibles errores

## Configuración de React Router

El archivo `vercel.json` ya está configurado con las redirecciones necesarias para que React Router funcione correctamente. Todas las rutas se redirigen a `index.html` para que el cliente pueda manejar el enrutamiento.

## Variables de Entorno

### Producción
```
VITE_API_URL=https://tu-backend.onrender.com/api
```

### Desarrollo Local
Crea un archivo `.env` en la raíz del proyecto:
```
VITE_API_URL=http://localhost:5000/api
```

**Importante:** 
- Las variables de entorno en Vite deben tener el prefijo `VITE_`
- Estas variables se incluyen en el build en tiempo de compilación
- Si cambias una variable de entorno en Vercel, necesitas hacer un nuevo deploy

## Actualizaciones Futuras

Cada vez que hagas `git push` a la rama principal, Vercel desplegará automáticamente una nueva versión.

Para desplegar manualmente:
1. Ve a tu proyecto en Vercel
2. Haz clic en **"Deployments"**
3. Haz clic en **"Redeploy"** en el deployment que quieras

## Solución de Problemas

### Error: "Cannot find module"
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de que `npm install` se ejecute correctamente

### Error: "API URL not found"
- Verifica que la variable `VITE_API_URL` esté configurada en Vercel
- Asegúrate de que el valor sea correcto (con `https://` y `/api` si es necesario)
- Haz un nuevo deploy después de cambiar variables de entorno

### Error: "404 en rutas de React Router"
- Verifica que `vercel.json` esté en la raíz del proyecto
- Asegúrate de que las redirecciones estén configuradas correctamente

### Error de CORS
- Verifica que tu backend en Render permita requests desde tu dominio de Vercel
- Asegúrate de configurar CORS correctamente en el backend

## URLs Importantes

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Documentación Vercel:** https://vercel.com/docs
- **Documentación Vite:** https://vitejs.dev

## Checklist Pre-Despliegue

- [ ] Código commitado y pusheado a Git
- [ ] Build local funciona (`npm run build`)
- [ ] Variable `VITE_API_URL` configurada en Vercel
- [ ] Backend desplegado y accesible
- [ ] CORS configurado en el backend para aceptar requests de Vercel
- [ ] `vercel.json` presente en la raíz del proyecto

¡Listo! Tu aplicación debería estar funcionando en Vercel. 🚀

