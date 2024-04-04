import { NextFunction, Request, Response } from 'express';

import { UserWorker } from '@src/business/userWorker';

const userManagementMiddleware = (
  permissions: Array<string>,
  worker: UserWorker
) => {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const rawToken = request.headers.authorization!.split(' ')[1];
      const encodedTokenPayload = rawToken.split('.')[1];
      const tokenPayload: JSON.JSONObject = JSON.parse(
        Buffer.from(encodedTokenPayload!, 'base64').toString('ascii')
      );

      const dbUser = await worker.handleAuthorization(
        tokenPayload,
        permissions
      );
      request.body.rawToken = rawToken;
      request.body.user = dbUser;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default userManagementMiddleware;
