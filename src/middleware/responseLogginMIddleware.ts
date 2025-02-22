import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger'; 

let hasSendBeenOverridden = false;

@Injectable()
export class ResponseLoggingMiddleware implements NestMiddleware {
  constructor(private logger: Logger) {}

  use(req: Request, res: Response, next: NextFunction) {
    (req as any).startTime = Date.now();
    if (!hasSendBeenOverridden) {
      const originalSend = res.send;
      res.send = (body: any) => {
        originalSend.apply(res, [body]);
        res.on('finish', () => {
          const { method, url } = req;
          const { statusCode } = res;
          const contentLength = res.get('Content-Length');
          const responseTime = Date.now() - (req as any)['startTime']; // Assuming a start time has been set elsewhere

          const logMessage = `${method} ${url} - ${statusCode} ${contentLength} - ${responseTime}ms`;
          this.logger.log('info' ,logMessage);
        });
        return res;
      };
      hasSendBeenOverridden = true;
    }
    next();
  }
}