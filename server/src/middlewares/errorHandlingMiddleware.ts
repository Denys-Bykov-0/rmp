import { Request, Response } from 'express';

import { ProcessingError } from '@src/business/processingError';
import { serverLogger } from '@src/utils/server/logger';

const errorHandlingMiddleware = async (
  error: Error,
  request: Request,
  response: Response
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

  serverLogger.error(`Unhandled error: ${error}`);
  response.status(500).json({
    message: 'Internal Server Error',
  });
};

export default errorHandlingMiddleware;
