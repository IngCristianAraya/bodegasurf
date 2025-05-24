// Configuración de la aplicación
const config = {
  // Configuración del servidor
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Configuración de la base de datos
  db: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/ventas-bodega',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex: true,
      // useFindAndModify: false
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

// Exportar configuración usando ESM
export const PORT = config.port;
export const NODE_ENV = config.nodeEnv;
export const FRONTEND_URL = config.frontendUrl;

export const MONGO_URI = config.db.uri;
export const DB_OPTIONS = config.db.options;

export const JWT_SECRET = config.jwt.secret;
export const JWT_EXPIRE = config.jwt.expiresIn;
export const JWT_COOKIE_EXPIRE = config.jwt.cookieExpire;

export const EMAIL_HOST = config.email.host;
export const EMAIL_PORT = config.email.port;
export const EMAIL_SECURE = config.email.secure;
export const EMAIL_USERNAME = config.email.auth.user;
export const EMAIL_PASSWORD = config.email.auth.pass;
export const EMAIL_FROM = config.email.from;

export const APP_NAME = config.app.name;
export const APP_VERSION = config.app.version;
export const APP_DESCRIPTION = config.app.description;
export const LOG_LEVEL = config.app.logLevel;

export const CORS_ORIGIN = config.cors.origin;
export const CORS_METHODS = config.cors.methods;
export const CORS_ALLOWED_HEADERS = config.cors.allowedHeaders;
export const CORS_CREDENTIALS = config.cors.credentials;
