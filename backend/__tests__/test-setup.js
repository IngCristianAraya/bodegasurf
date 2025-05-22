// Configuración global para las pruebas (CommonJS)
const { configure } = require('@testing-library/dom');
const { TextEncoder, TextDecoder } = require('util');

// Configurar el tiempo de espera para las pruebas (30 segundos)
jest.setTimeout(30000);

// Configurar testing-library
configure({
  testIdAttribute: 'data-testid',
});

// Configurar TextEncoder y TextDecoder para el entorno de prueba
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock de console.log para evitar ruido en las pruebas
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Configurar variables de entorno para pruebas
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-1234567890';
  process.env.JWT_EXPIRE = '30d';
  process.env.JWT_COOKIE_EXPIRE = '30';
  process.env.MONGODB_URI = 'mongodb://localhost:27017/ventas-bodega-test';
  process.env.PORT = '5000';
  
  // Configurar console mocks
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  // Restaurar console originales
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

afterEach(() => {
  // Limpiar todos los mocks después de cada prueba
  jest.clearAllMocks();
});

// Configuración global para manejar errores no capturados
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection during test execution:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception during test execution:', error);
});