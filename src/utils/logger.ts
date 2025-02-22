import { Response } from 'express';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { Injectable } from '@nestjs/common';
import { LogLevel, LogParams, Message , ResponseParams } from '../types/utils.type'

@Injectable()
export class Logger {
  private logFormat: winston.Logform.Format;
  private infoLogger : winston.Logger;
  private warnLogger : winston.Logger;
  private errorLogger : winston.Logger;
  private Loggers : { [key in LogLevel]: (message: Message) => void };
  private logDir : string;
  private environment: string;
  private title : string;
  private service : string;
  constructor() {
    this.title = process.env.TITLE || "none";
    this.service = 'zeus-login';
    this.logDir = `${process.cwd()}/logs`;
    this.environment = process.env.ELASTIC_APM_ENVIRONMENT ?? "staging";
    this.logFormat = winston.format.printf(({ level , message }) => {
        const timeStamp = new Date().toISOString();
        const { zeusId, requestUrl , msg } = message as Message;
        const developStep = this.environment === 'production' ? 'v1' : 'test';
        return `[${this.environment}][${level}][${this.service}][${this.title}][${developStep}][${requestUrl}][${zeusId}][${msg}][${timeStamp}]`;
    });
    this.infoLogger = this.createWinstonLogger('info' , 'info');
    this.warnLogger = this.createWinstonLogger('warn' , 'error');
    this.errorLogger = this.createWinstonLogger('error' , 'error');
    this.Loggers = {
      "info": (message: Message) => this.infoLogger.info(message),
      "warn": (message: Message) => this.warnLogger.warn(message),
      "error": (message: Message) => this.errorLogger.error(message)
    };
  }

  private createWinstonLogger(level: string, directory: string): winston.Logger {
    const transport = new winston.transports.DailyRotateFile({
      level: level,
      datePattern: 'YYYY-MM-DD',
      dirname: `${this.logDir}/${this.title}/${this.service}`,
      filename: `${directory}-%DATE%.log`,
      maxFiles: 2,
    });
    
    return winston.createLogger({
      format: winston.format.combine(
        this.logFormat,
      ),
      transports: [
        transport
      ],
    });
  }

  private consoleLog(endpoint : string , startTime : number, params = {}) {
    console.log(JSON.stringify({
      't': new Date().toISOString(),
      'pid': process.pid,
      'endpoint': endpoint,
      'elapsed': Date.now() - startTime,
      'params': params
    }));
  }
  
  public log(level : LogLevel, logMessage : string[] | string) {
    const requestUrl = logMessage[0] || "/";
    const msg = logMessage[1] || " ";
    const zeusId = logMessage[2] || "NotUsed";
    this.Loggers[level]({requestUrl: requestUrl, msg: msg , zeusId: zeusId});
  }

  public logAndSend(endpoint : string, startTime : number , res: Response, responseParams : ResponseParams, level : LogLevel, logMessage : string[], msg = null ) : Response{
    const logParams : LogParams= {};
    if(responseParams.reason instanceof Error){
      responseParams.reason = responseParams.reason.toString();
    }
    logParams['result'] = responseParams.result;
    logParams['reason'] = responseParams.reason;
    this.consoleLog(endpoint, startTime, logParams);
    const requestUrl = logMessage[0] || "/";
    const zeusId = logMessage[1] || "NotUsed";
    this.Loggers[level]({requestUrl: requestUrl , msg: msg || responseParams.reason || " " , zeusId : zeusId });
    return res.send(responseParams);
  }
}
