import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger'; 

// Declare the extension inline
declare module 'express' {
  interface Request {
    startTime?: number;
  }
}

@Injectable()
export class ResponseLoggingMiddleware implements NestMiddleware {
  constructor(private logger: Logger) {}

  use(req: Request, res: Response, next: NextFunction) {
    req.startTime = Date.now();
    const originalSend = res.send;
    res.send = (body: any) => {
      originalSend.apply(res, [body]);
      res.once('finish', () => {
        const { method, url } = req;
        const { statusCode } = res;
        const contentLength = res.get('Content-Length') || '0';
        const responseTime = Date.now() - (req.startTime as number);
  
        this.logger.log('info', [
          url,                                      // requestUrl
          `${method} ${statusCode} ${contentLength} - ${responseTime}ms`, // msg
          'NotUsed'                                 // zeusId
        ]);
      });
      return res;
    };
  
    next();
  }
}