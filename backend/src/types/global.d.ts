import { User as UserModel } from '../models/User';

declare global {
  namespace NodeJS {
    interface Global {
      __basedir: string;
    }
  }

  namespace Express {
    interface Request {
      user?: UserModel;
    }
  }

  // Extender el tipo de mongoose para incluir los modelos
  namespace mongoose {
    interface Models {
      User: typeof UserModel;
    }
  }
}

declare module 'express-rate-limit' {
  import { RequestHandler } from 'express';
  
  interface Options {
    windowMs?: number;
    max?: number | ((req: any) => number) | ((req: any) => Promise<number>);
    message?: any;
    statusCode?: number;
    legacyHeaders?: boolean;
    standardHeaders?: boolean | string;
    skipFailedRequests?: boolean;
    skipSuccessfulRequests?: boolean;
    keyGenerator?: (req: any, res?: any) => string | Promise<string>;
    handler?: (req: any, res: any, next: any, options: any) => any;
    onLimitReached?: (req: any, res: any, options: any) => any;
    skip?: (req: any, res: any) => boolean | Promise<boolean>;
    requestPropertyName?: string;
    store?: any;
  }
  
  function rateLimit(options?: Options): RequestHandler;
  
  namespace rateLimit {
    class Store {
      incr(key: string, cb: (err: any, hits: number, resetTime: Date) => void): void;
      decrement(key: string): void;
      resetKey(key: string): void;
      resetAll(): void;
    }
  }
  
  export = rateLimit;
}

declare module 'helmet' {
  import { RequestHandler } from 'express';
  
  interface IHelmetConfiguration {
    contentSecurityPolicy?: boolean | any;
    dnsPrefetchControl?: boolean | any;
    expectCt?: boolean | any;
    frameguard?: boolean | any;
    hidePoweredBy?: boolean | any;
    hsts?: boolean | any;
    ieNoOpen?: boolean | any;
    noCache?: boolean | any;
    noSniff?: boolean | any;
    permittedCrossDomainPolicies?: boolean | any;
    referrerPolicy?: boolean | any;
    xssFilter?: boolean | any;
  }
  
  function helmet(options?: IHelmetConfiguration): RequestHandler;
  
  namespace helmet {
    function contentSecurityPolicy(options?: any): RequestHandler;
    function dnsPrefetchControl(options?: any): RequestHandler;
    function expectCt(options?: any): RequestHandler;
    function frameguard(options?: any): RequestHandler;
    function hidePoweredBy(options?: any): RequestHandler;
    function hsts(options?: any): RequestHandler;
    function ieNoOpen(options?: any): RequestHandler;
    function noCache(options?: any): RequestHandler;
    function noSniff(options?: any): RequestHandler;
    function permittedCrossDomainPolicies(options?: any): RequestHandler;
    function referrerPolicy(options?: any): RequestHandler;
    function xssFilter(options?: any): RequestHandler;
  }
  
  export = helmet;
}
