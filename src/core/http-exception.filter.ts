import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status).json({
      error: 'Payload Too Large',
      message: 'File to large customize',
      statusCode: status,
    });
  }
}

@Catch(BadRequestException)
export class CustomBadRequestExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse() as any;

    let errorResponse: any = {
      message: 'Bad Request',
      error: 'Bad Request',
      statusCode: status,
    };

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      if (exceptionResponse.message) {
        errorResponse.message = exceptionResponse.message;
      }
      if (exceptionResponse.field) {
        errorResponse.field = exceptionResponse.field;
      }
    }

    response.status(status).json(errorResponse);
  }
}
