import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, BadRequestException, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoError } from 'mongodb';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
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
    // Handle Mongoose CastError (e.g., invalid ObjectId)
    else if (exception instanceof Error && exception.name === 'CastError') {
      status = HttpStatus.BAD_REQUEST; // 400
      message = 'Invalid data format: ' + exception.message;
    }
    // Handle MongoDB duplicate key errors
    else if (exception instanceof MongoError && exception.code === 11000) {
      status = HttpStatus.CONFLICT; // 409
      message = 'Duplicate resource: ' + exception.message;
    }
    // Handle generic Errors with specific cases
    else if (exception instanceof Error) {
      message = exception.message;
      // More robust checks (avoid string matching if possible)
      if (exception instanceof Error && exception.message.includes('not found')) {
        status = HttpStatus.NOT_FOUND; // 404
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR; // 500
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