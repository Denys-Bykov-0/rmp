import Express from 'express';
import pg from 'pg';

import { FileWorker } from '@src/business/fileWorker';
import { ProcessingError } from '@src/business/processingError';
import { FileRepository, SourceRepository, TagRepository } from '@src/data';
import { FileSystemRepository } from '@src/data/fileSystemRepository';
import { FileTagger } from '@src/data/fileTagger';
import { PlaylistRepository } from '@src/data/playlistRepository';
import { Config } from '@src/entities/config';
import { PluginManager } from '@src/pluginManager';
import { SQLManager } from '@src/sqlManager';

import { BaseController } from './baseController';

class FileController extends BaseController {
  constructor(
    config: Config,
    dbPool: pg.Pool,
    sqlManager: SQLManager,
    pluginManager?: PluginManager
  ) {
    super(config, dbPool, sqlManager, pluginManager);
  }

  private buildFileWorker = (): FileWorker => {
    return new FileWorker(
      new FileRepository(this.dbPool, this.sqlManager),
      new SourceRepository(this.dbPool, this.sqlManager),
      new TagRepository(this.dbPool, this.sqlManager),
      new PlaylistRepository(this.dbPool, this.sqlManager),
      new FileSystemRepository(this.config),
      this.pluginManager!.getFilePlugin(),
      this.pluginManager!.getTagPlugin(),
      new FileTagger(this.config.appPathStorage)
    );
  };

  public addFile = async (
    request: Express.Request,
    response: Express.Response,
    next: Express.NextFunction
  ) => {
    try {
      const { url, user } = request.body;
      const fileWorker = this.buildFileWorker();

      const result = await fileWorker.addFile(url, user);
      response.status(200).json(result!);
    } catch (error) {
      next(error);
    }
  };

  public getFilesByUser = async (
    request: Express.Request,
    response: Express.Response,
    next: Express.NextFunction
  ) => {
    try {
      const { user } = request.body;
      let deviceIdParam: string;
      {
        const { deviceId } = request.query;
        if (!deviceId) {
          const opts = {
            message: 'Device ID is required',
          };
          throw new ProcessingError(opts);
        }
        deviceIdParam = deviceId!.toString();
      }

      let statusesParam: Array<string> | null = null;
      {
        const { statuses } = request.query;
        if (statuses) {
          statusesParam = statuses.toString().split(',');
        }
      }

      let synchronizedParam: boolean | null = null;
      {
        const { synchronized } = request.query;
        if (synchronized) {
          synchronizedParam = JSON.parse(synchronized.toString());
        }
      }

      let playlistsParam: Array<string> | null = null;
      {
        const { playlists } = request.query;
        if (playlists) {
          playlistsParam = playlists.toString().split(',');
        }
      }

      const fileWorker = this.buildFileWorker();

      const result = await fileWorker.getTaggedFilesByUser(
        user,
        deviceIdParam,
        statusesParam,
        synchronizedParam,
        playlistsParam
      );
      return response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public getTaggedFile = async (
    request: Express.Request,
    response: Express.Response,
    next: Express.NextFunction
  ) => {
    try {
      const { user } = request.body;
      const { fileId } = request.params;
      let deviceIdParam: string;
      {
        const { deviceId } = request.query;
        if (!deviceId) {
          const opts = {
            message: 'Device ID is required',
          };
          throw new ProcessingError(opts);
        }
        deviceIdParam = deviceId!.toString();
      }

      const { expand } = request.query;
      const fileWorker = this.buildFileWorker();
      const expandOptions = expand ? expand.toString().split(',') : [];
      const result = await fileWorker.getTaggedFile(
        fileId,
        deviceIdParam,
        user,
        expandOptions
      );
      return response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public confirmFile = async (
    request: Express.Request,
    response: Express.Response,
    next: Express.NextFunction
  ) => {
    try {
      const { user } = request.body;
      const { fileId } = request.params;

      let deviceIdParam: string;
      {
        const { deviceId } = request.query;
        if (!deviceId) {
          const opts = {
            message: 'Device ID is required',
          };
          throw new ProcessingError(opts);
        }
        deviceIdParam = deviceId!.toString();
      }

      const fileWorker = this.buildFileWorker();
      const result = await fileWorker.confirmFile(fileId, user, deviceIdParam);
      return response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public downloadFile = async (
    request: Express.Request,
    response: Express.Response,
    next: Express.NextFunction
  ) => {
    try {
      const { user } = request.body;
      const { fileId } = request.params;

      const fileWorker = this.buildFileWorker();
      const result = await fileWorker.downloadFile(fileId, user.id);
      response.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename=${result.name}`,
        'Content-Length': result.data.length,
      });

      return response.end(result.data);
    } catch (error) {
      next(error);
    }
  };

  public deleteFile = async (
    request: Express.Request,
    response: Express.Response,
    next: Express.NextFunction
  ) => {
    try {
      const { user } = request.body;
      const { playlistIds } = request.query;
      const { fileId } = request.params;
      const fileWorker = this.buildFileWorker();
      await fileWorker.deleteFile(
        fileId,
        user.id,
        playlistIds!.toString().split(',')
      );
      return response.status(200).json();
    } catch (error) {
      next(error);
    }
  };
}

export { FileController };
