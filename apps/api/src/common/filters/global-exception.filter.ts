import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string' ? exceptionResponse : (exceptionResponse as any).message || 'Http exception';
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Manejo de errores específicos de Prisma
      switch (exception.code) {
        case 'P2002':
          statusCode = HttpStatus.BAD_REQUEST; // Constraint violation
          const fields = (exception.meta?.target as string[])?.join(', ');
          message = `Unique constraint failed on the fields: ${fields || 'unknown'}`;
          break;
        case 'P2025':
          statusCode = HttpStatus.NOT_FOUND;
          message = 'Record to update not found.';
          break;
        default:
          statusCode = HttpStatus.BAD_REQUEST;
          message = `Database error: ${exception.message}`;
          break;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(statusCode).json({
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
