import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, BadRequestException, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    console.log("exception");
    console.log(exception);
    console.log(typeof exception);
    console.log(exception instanceof BadRequestException);
    console.log(exception instanceof NotFoundException);
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    console.log(status)
    let message = 'An unknown error occurred';

    // Handle specific HTTP exceptions from NestJS
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    } 
    // Handle validation errors (typically client-side)
    else if (exception instanceof Error && exception.name === 'ValidationError') {
      status = HttpStatus.BAD_REQUEST; // 400
      message = exception.message;
    }
    // Handle TypeORM specific errors
    else if (exception instanceof Error && 'code' in exception) {
      switch ((exception as any).code) {
        case 'ER_DUP_ENTRY': // MySQL duplicate entry
          status = HttpStatus.CONFLICT; // 409
          message = 'Resource already exists';
          break;
        case 'ER_NO_REFERENCED_ROW': // Foreign key constraint
        case 'ER_ROW_IS_REFERENCED':
          status = HttpStatus.BAD_REQUEST; // 400
          message = 'Invalid reference provided';
          break;
        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR; // 500
          message = exception.message;
      }
    }
    // Handle generic Error objects
    else if (exception instanceof Error) {
      // You can add more specific error checking here
      message = exception.message;
      // Check if the error message suggests a client-side issue
      if (message.toLowerCase().includes('not found')) {
        status = HttpStatus.NOT_FOUND; // 404
      } else if (message.toLowerCase().includes('unauthorized')) {
        status = HttpStatus.UNAUTHORIZED; // 401
      } else if (message.toLowerCase().includes('forbidden')) {
        status = HttpStatus.FORBIDDEN; // 403
      }
    }
    console.log("just before");
    console.log(status);
    response
      .status(status)
      .json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: message
      });
  }
}