# Backend para Sistema de Gestión de Bodegas (SaaS)

Este es el backend para un sistema de gestión de bodegas multi-tenant construido con Node.js, Express y MongoDB.

## Características

- Autenticación JWT con soporte para múltiples roles
- Arquitectura multi-tenant basada en subdominios
- API RESTful para gestionar productos, clientes y ventas
- Manejo de errores centralizado
- Validación de datos
- Seguridad mejorada con Helmet, rate limiting, etc.
- Logging con Winston
- Documentación de la API (próximamente)

## Requisitos Previos

- Node.js (v14 o superior)
- MongoDB (local o Atlas)
- npm o yarn

## Configuración

1. Clonar el repositorio
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd ventas-bodega/backend
   ```

2. Instalar dependencias
   ```bash
   npm install
   # o
   yarn install
   ```

3. Configurar variables de entorno
   - Copiar el archivo `.env.example` a `.env`
   - Configurar las variables según tu entorno

   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ventas_bodega
   JWT_SECRET=tu_clave_secreta_aqui
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   ```

4. Inicializar el tenant por defecto
   ```bash
   npm run init:tenant
   ```

## Ejecución

### Modo desarrollo
```bash
npm run dev
```

### Modo producción
```bash
npm start
```

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/         # Configuraciones
│   ├── controllers/     # Controladores
│   ├── middleware/      # Middlewares
│   ├── models/          # Modelos de MongoDB
│   ├── routes/          # Rutas de la API
│   ├── utils/           # Utilidades
│   ├── app.js           # Aplicación Express
│   └── server.js        # Punto de entrada
├── scripts/            # Scripts de utilidad
├── .env.example        # Variables de entorno de ejemplo
├── .eslintrc.js        # Configuración de ESLint
├── .prettierrc         # Configuración de Prettier
└── package.json        # Dependencias y scripts
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar un nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener información del usuario actual
- `PUT /api/auth/updatedetails` - Actualizar detalles del usuario
- `PUT /api/auth/updatepassword` - Actualizar contraseña
- `POST /api/auth/forgotpassword` - Solicitar restablecimiento de contraseña
- `PUT /api/auth/resetpassword/:resettoken` - Restablecer contraseña
- `GET /api/auth/logout` - Cerrar sesión

### Productos
- `GET /api/products` - Obtener todos los productos
- `GET /api/products/:id` - Obtener un producto por ID
- `POST /api/products` - Crear un nuevo producto
- `PUT /api/products/:id` - Actualizar un producto
- `DELETE /api/products/:id` - Eliminar un producto

### Clientes
- `GET /api/customers` - Obtener todos los clientes
- `GET /api/customers/:id` - Obtener un cliente por ID
- `POST /api/customers` - Crear un nuevo cliente
- `PUT /api/customers/:id` - Actualizar un cliente
- `DELETE /api/customers/:id` - Eliminar un cliente

### Ventas
- `GET /api/sales` - Obtener todas las ventas
- `GET /api/sales/:id` - Obtener una venta por ID
- `POST /api/sales` - Crear una nueva venta
- `PUT /api/sales/:id` - Actualizar una venta
- `DELETE /api/sales/:id` - Eliminar una venta

## Despliegue

### Requisitos
- MongoDB (local o en la nube)
- Node.js instalado en el servidor
- Git instalado en el servidor

### Pasos para el despliegue

1. Clonar el repositorio en el servidor
   ```bash
   git clone [URL_DEL_REPOSITORIO] ventas-bodega
   cd ventas-bodega/backend
   ```

2. Instalar dependencias
   ```bash
   npm install --production
   ```

3. Configurar las variables de entorno en el archivo `.env`

4. Inicializar el tenant por defecto
   ```bash
   npm run init:tenant
   ```

5. Iniciar la aplicación
   ```bash
   npm start
   ```

### Usando PM2 (recomendado para producción)

1. Instalar PM2 globalmente
   ```bash
   npm install -g pm2
   ```

2. Iniciar la aplicación con PM2
   ```bash
   pm2 start src/server.js --name "ventas-bodega"
   ```

3. Configurar PM2 para que se inicie automáticamente
   ```bash
   pm2 startup
   pm2 save
   ```

## Pruebas

Para ejecutar las pruebas (próximamente):

```bash
npm test
```

## Contribución

1. Hacer un fork del proyecto
2. Crear una rama para tu característica (`git checkout -b feature/AmazingFeature`)
3. Hacer commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Hacer push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto

Tu Nombre - [@tu_twitter](https://twitter.com/tu_twitter) - tu@email.com

Enlace del proyecto: [https://github.com/tu_usuario/ventas-bodega](https://github.com/tu_usuario/ventas-bodega)
