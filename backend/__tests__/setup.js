// Configuración global para las pruebas
import { configure } from '@testing-library/dom';

// Configurar el tiempo de espera para las pruebas
jest.setTimeout(30000);

// Configurar testing-library
configure({
  testIdAttribute: 'data-testid',
});

// Mock de console.log para evitar ruido en las pruebas
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

// Limpiar mocks después de cada prueba
afterEach(() => {
  jest.clearAllMocks();
});

// Configurar variables de entorno para pruebas
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRE = '30d';
process.env.JWT_COOKIE_EXPIRE = '30';
process.env.MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/ventas-bodega-test';
process.env.PORT = '5000';
