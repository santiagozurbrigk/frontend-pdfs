# Solución de Error de Node.js v25 en Render

## Problema

Render está usando Node.js v25.2.1 que tiene problemas de compatibilidad con dependencias antiguas como `buffer-equal-constant-time` (usado por `jwa` que es usado por `jsonwebtoken`).

## Solución Aplicada

Se han creado los siguientes archivos para forzar a Render a usar Node.js v20 (LTS):

1. **`.nvmrc`** - Especifica Node.js 20
2. **`package.json`** - Actualizado `engines` para limitar a Node.js 18-20
3. **`render.yaml`** - Configuración específica de Render

## Cambios Realizados

### 1. Archivo `.nvmrc`
```
20
```

### 2. Actualización en `package.json`
```json
"engines": {
  "node": ">=18.0.0 <=20.x.x"
}
```

### 3. Archivo `render.yaml`
```yaml
services:
  - type: web
    name: backend-lowcostapp
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_VERSION
        value: 20.18.0
```

## Pasos Adicionales en Render Dashboard

Si Render aún usa Node.js v25 después del despliegue, necesitas configurarlo manualmente:

1. **Ve al Dashboard de Render:**
   - https://dashboard.render.com

2. **Selecciona tu servicio backend**

3. **Ve a "Settings" → "Environment"**

4. **Agrega o actualiza la variable de entorno:**
   - **Key:** `NODE_VERSION`
   - **Value:** `20.18.0`

5. **Alternativamente, en "Settings" → "Build & Deploy":**
   - Busca la opción "Node Version" o "Runtime"
   - Selecciona Node.js 20.x

6. **Guarda los cambios y haz un "Manual Deploy"**

## Verificación

Después del despliegue, verifica en los logs de Render que esté usando Node.js 20:

```
Node.js v20.x.x
```

En lugar de:
```
Node.js v25.2.1
```

## Si el Problema Persiste

Si Render sigue usando Node.js v25, puedes:

1. **Actualizar las dependencias problemáticas:**
   ```bash
   npm update jsonwebtoken
   npm update jwa
   ```

2. **O usar una versión específica compatible:**
   ```json
   "jsonwebtoken": "^9.0.2"
   ```

3. **Verificar que el archivo `.nvmrc` esté en la raíz del repositorio**

## Notas

- Node.js v20 es una versión LTS (Long Term Support) más estable
- Las versiones v25+ pueden tener problemas de compatibilidad con paquetes antiguos
- Render debería detectar automáticamente el archivo `.nvmrc` o `render.yaml`

## Referencias

- [Render Node.js Version Documentation](https://render.com/docs/node-version)
- [Node.js Releases](https://nodejs.org/en/about/releases/)

