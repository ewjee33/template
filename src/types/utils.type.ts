export type Message = {
    zeusId: string; 
    requestUrl: string; 
    msg: string;
}

export interface ResponseParams {
    result: 'success' | 'failure',
    reason: string | Error;
  }
  
export interface LogParams {
    result?: string;
    reason?: string;
}

export type LogLevel = 'info' | 'warn' | 'error';