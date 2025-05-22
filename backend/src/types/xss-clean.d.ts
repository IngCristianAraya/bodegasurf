declare module 'xss-clean' {
  import { RequestHandler } from 'express';
  
  interface XSSOptions {
    // Opciones de configuración si las hay
  }
  
  function xssClean(options?: XSSOptions): RequestHandler;
  
  export = xssClean;
}
