import jwt from 'jsonwebtoken';

import { AccessToken } from '@src/entities/accessToken';
import { Config } from '@src/entities/config';
import { RefreshToken } from '@src/entities/refreshToken';
import { Response } from '@src/entities/response';
import { LoginRequest } from '@src/entities/user';
import { IAuthorizationDatabase } from '@src/interfaces/iAuthorizationDatabase';
import { dataLogger } from '@src/utils/server/logger';

export class AuthWorker {
  private db: IAuthorizationDatabase;
  private config: Config;
  constructor(db: IAuthorizationDatabase, config: Config) {
    this.db = db;
    this.config = config;
    dataLogger.trace('AuthWorker initialized');
  }

  public verifyAccessToken = (token: string): boolean => {
    const secret = this.config.apiAccessTokenSecret;
    let isValid: boolean = true;
    jwt.verify(token, secret, (err: jwt.VerifyErrors | null) => {
      if (err) {
        dataLogger.warn(`Error verifying token: ${err}`);
        isValid = false;
      }
    });
    return isValid;
  };

  public verifyRefreshToken = (token: string): boolean => {
    const secret = this.config.apiRefreshTokenSecret;
    let isValid: boolean = true;
    jwt.verify(token, secret, (err: jwt.VerifyErrors | null) => {
      if (err) {
        dataLogger.warn(`Error verifying token: ${err}`);
        isValid = false;
      }
    });
    return isValid;
  };

  public generateAccessToken = (userId: number): string => {
    const secret = this.config.apiAccessTokenSecret;
    const expiresIn = this.config.apiAccesTokenSecretExpires;
    const token = jwt.sign({ userId }, secret, {
      expiresIn,
    });
    return token;
  };

  public generateRefreshToken = (userId: number): string => {
    const secret = this.config.apiRefreshTokenSecret;
    const expiresIn = this.config.apiRefreshTokenSecretExpires;
    const token = jwt.sign({ userId }, secret, {
      expiresIn,
    });
    return token;
  };

  public invalidateTokenTree = async (refreshToken: RefreshToken) => {
    const commonAncestorId = refreshToken.commonAncestorId
      ? refreshToken.commonAncestorId
      : refreshToken.id;
    await this.db.deleteRefreshToken(commonAncestorId);
  };

  public login = async (LoginRequest: LoginRequest) => {
    const { name } = LoginRequest;
    const user = await this.db.findUserByName(name);

    if (!user) {
      dataLogger.debug('User not found');
      return new Response(Response.Code.Forbidden, 'User not found', 1);
    }

    const refreshToken: RefreshToken = new RefreshToken(
      0,
      this.generateRefreshToken(user.id),
      null,
      user.id,
      null,
      'A'
    );

    try {
      const refreshTokenId = await this.db.insertRefreshToken(refreshToken);
      const accessToken: AccessToken = new AccessToken(
        0,
        this.generateAccessToken(user.id),
        refreshTokenId,
        user.id
      );
      await this.db.insertAccessToken(accessToken);
      return new Response(Response.Code.Ok, {
        accessToken: accessToken.token,
        refreshToken: refreshToken.token,
      });
    } catch (err) {
      dataLogger.error('AuthWorker.login failed');
      throw new Error('AuthWorker.login failed');
    } finally {
      dataLogger.trace('AuthWorker.login quitting');
    }
  };

  public getAccessToken = async (refreshToken: string) => {
    const tmpRefreshToken = await this.db.findRefreshToken(refreshToken);
    if (!tmpRefreshToken) {
      return new Response(Response.Code.Forbidden, 'RefreshToken not found', 1);
    }

    if (!this.verifyRefreshToken(refreshToken)) {
      this.invalidateTokenTree(tmpRefreshToken);
      return new Response(
        Response.Code.Unauthorized,
        'Authorization is expired',
        1
      );
    }
    const childAccessToken = await this.db.findAccessTokenByRefreshTokenId(
      tmpRefreshToken.id
    );

    if (childAccessToken) {
      dataLogger.warn('Trying to reuse refresh token');
      this.invalidateTokenTree(tmpRefreshToken);
      return new Response(
        Response.Code.Unauthorized,
        'Authorization is expired',
        1
      );
    }
    const newAccessToken: AccessToken = new AccessToken(
      0,
      this.generateAccessToken(tmpRefreshToken.userId),
      tmpRefreshToken.id,
      tmpRefreshToken.userId
    );
    await this.db.insertAccessToken(newAccessToken);
    return new Response(Response.Code.Ok, {
      accessToken: newAccessToken.token,
    });
  };

  public getRefreshToken = async (refreshToken: string) => {
    const tmpRefreshToken = await this.db.findRefreshToken(refreshToken);
    if (!tmpRefreshToken) {
      return new Response(
        Response.Code.Forbidden,
        'RefreshToken is not found',
        1
      );
    }
    if (tmpRefreshToken.status === 'I') {
      this.invalidateTokenTree(tmpRefreshToken);
      return new Response(
        Response.Code.Unauthorized,
        'Authorization is expired',
        1
      );
    }

    if (!this.verifyRefreshToken(refreshToken)) {
      this.invalidateTokenTree(tmpRefreshToken);
      return new Response(
        Response.Code.Unauthorized,
        'Authorization is expired',
        1
      );
    }

    const childToken = await this.db.findRefreshTokenByParentId(
      tmpRefreshToken.id
    );

    if (childToken) {
      dataLogger.warn('Trying to reuse refreshToken');
      this.invalidateTokenTree(tmpRefreshToken);
      return new Response(
        Response.Code.Unauthorized,
        'Authorization is expired',
        1
      );
    }
    tmpRefreshToken.status = 'I';
    const newRefreshToken: RefreshToken = new RefreshToken(
      0,
      this.generateRefreshToken(tmpRefreshToken.userId),
      tmpRefreshToken.id,
      tmpRefreshToken.userId,
      tmpRefreshToken.commonAncestorId,
      'A'
    );

    const newRefreshTokenId = await this.db.updateRefreshToken(
      newRefreshToken,
      tmpRefreshToken
    );

    let tmpAccessToken = await this.db.findAccessTokenByRefreshTokenId(
      newRefreshTokenId
    );

    if (!tmpAccessToken) {
      dataLogger.debug(
        'AuthWorker.getRefreshToken access token not found, creating new'
      );
      tmpAccessToken = new AccessToken(
        0,
        this.generateAccessToken(tmpRefreshToken.userId),
        newRefreshTokenId,
        tmpRefreshToken.userId
      );
      try {
        await this.db.insertAccessToken(tmpAccessToken);
      } catch (err) {
        dataLogger.error(
          'AuthWorker.getRefreshToken failed to insert new access token'
        );
      }
    }

    return new Response(Response.Code.Ok, {
      accessToken: tmpAccessToken.token,
      refreshToken: newRefreshToken.token,
    });
  };

  public auth = async (token: string): Promise<boolean> => {
    const tokenObj = await this.db.findAccessToken(token);
    if (!tokenObj) {
      return false;
    }
    if (!this.verifyAccessToken(token)) {
      try {
        await this.db.deleteAccessToken(tokenObj.id);
        return false;
      } catch (err) {
        dataLogger.error('AuthWorker.auth failed updating token status');
      }
      dataLogger.debug('AuthWorker.auth token expired');
      return false;
    }
    return true;
  };

  public deleteAccessToken = async (refreshToken: string) => {
    const token = await this.db.findRefreshToken(refreshToken);
    if (!token) {
      return new Response(
        Response.Code.BadRequest,
        'RefreshToken is not found',
        1
      );
    }
    const tmpAccessToken = await this.db.findAccessTokenByRefreshTokenId(
      token.id
    );
    if (!tmpAccessToken) {
      return new Response(
        Response.Code.BadRequest,
        'AccessToken is not found',
        1
      );
    }
    await this.db.deleteAccessToken(tmpAccessToken.id);
    return new Response(Response.Code.Ok, 'AccessToken deleted');
  };

  public deleteRefreshToken = async (refreshToken: string) => {
    const token = await this.db.findRefreshToken(refreshToken);
    if (!token) {
      return new Response(
        Response.Code.BadRequest,
        'RefreshToken is not found',
        1
      );
    }
    await this.invalidateTokenTree(token);
    return new Response(Response.Code.Ok, 'RefreshToken deleted');
  };
}