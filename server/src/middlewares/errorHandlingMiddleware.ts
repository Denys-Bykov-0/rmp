import { NextFunction, Request, Response } from 'express';

import { ProcessingError } from '@src/business/processingError';
import { serverLogger } from '@src/utils/server/logger';

const errorHandlingMiddleware = async (
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  if (error instanceof SyntaxError && 'body' in error) {
    return response
      .status(400)
      .json({ message: 'Invalid JSON syntax in request body', code: -1 });
  }

  if (error instanceof ProcessingError) {
    return response.status(400).json({
      message: error.message,
      code: error.errorCode,
    });
  }

  if (error instanceof Error) {
    serverLogger.error(`Unhandled error: ${error}`);
    return response.status(500).json({
      message: error.message,
      code: -1,
    });
  }

  next();
};

export default errorHandlingMiddleware;
