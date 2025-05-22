// Configuración de la aplicación
const config = {
  // Configuración del servidor
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Configuración de la base de datos
  db: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/ventas-bodega',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    }
  },
  
  // Configuración de JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'TuClaveSecretaMuySegura123!',
    expiresIn: process.env.JWT_EXPIRE || '30d',
    cookieExpire: process.env.JWT_COOKIE_EXPIRE || 30 // días
  },
  
  // Configuración de correo electrónico
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USERNAME || 'tucorreo@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'tucontraseña'
    },
    from: process.env.EMAIL_FROM || 'Ventas Bodega <noreply@ventasbodega.com>'
  },
  
  // Configuración de la aplicación
  app: {
    name: 'Sistema de Ventas Bodega',
    version: '1.0.0',
    description: 'Sistema de gestión de ventas para bodega',
    logLevel: process.env.LOG_LEVEL || 'debug'
  },
  
  // Configuración de CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }
};

// Exportar configuración
module.exports = {
  // Configuración general
  PORT: config.port,
  NODE_ENV: config.nodeEnv,
  
  // Base de datos
  MONGO_URI: config.db.uri,
  DB_OPTIONS: config.db.options,
  
  // JWT
  JWT_SECRET: config.jwt.secret,
  JWT_EXPIRE: config.jwt.expiresIn,
  JWT_COOKIE_EXPIRE: config.jwt.cookieExpire,
  
  // Email
  EMAIL_HOST: config.email.host,
  EMAIL_PORT: config.email.port,
  EMAIL_SECURE: config.email.secure,
  EMAIL_USERNAME: config.email.auth.user,
  EMAIL_PASSWORD: config.email.auth.pass,
  EMAIL_FROM: config.email.from,
  
  // Aplicación
  APP_NAME: config.app.name,
  APP_VERSION: config.app.version,
  APP_DESCRIPTION: config.app.description,
  LOG_LEVEL: config.app.logLevel,
  
  // CORS
  CORS_ORIGIN: config.cors.origin,
  CORS_METHODS: config.cors.methods,
  CORS_ALLOWED_HEADERS: config.cors.allowedHeaders,
  CORS_CREDENTIALS: config.cors.credentials
};
