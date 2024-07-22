import Express from 'express';
import pg from 'pg';

import { PlaylistWorker } from '@src/business/playlistWorker';
import { FileRepository, SourceRepository } from '@src/data';
import { PlaylistRepository } from '@src/data/playlistRepository';
import { Config } from '@src/entities/config';
import { PluginManager } from '@src/pluginManager';
import { SQLManager } from '@src/sqlManager';

import { BaseController } from './baseController';

class PlaylistController extends BaseController {
  constructor(
    config: Config,
    dbPool: pg.Pool,
    sqlManager: SQLManager,
    pluginManager?: PluginManager
  ) {
    super(config, dbPool, sqlManager, pluginManager);
  }

  private buildPlaylistWorker = (): PlaylistWorker => {
    return new PlaylistWorker(
      new PlaylistRepository(this.dbPool, this.sqlManager),
      new FileRepository(this.dbPool, this.sqlManager),
      new SourceRepository(this.dbPool, this.sqlManager),
      this.pluginManager!.getFilePlugin(),
      this.pluginManager!.getPlaylistPlugin()
    );
  };

  public getPlaylistsByUser = async (
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ): Promise<void> => {
    try {
      const { user } = req.body;
      const playlistWorker = this.buildPlaylistWorker();
      const result = await playlistWorker.getPlaylistsByUserId(user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public getPlaylistsByPlaylistId = async (
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ): Promise<void> => {
    try {
      const { user } = req.body;
      const { playlistId } = req.params;
      const playlistWorker = this.buildPlaylistWorker();
      const result = await playlistWorker.getPlaylistsByPlaylistId(
        user.id,
        playlistId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public createPlaylist = async (
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ): Promise<void> => {
    try {
      const { user, url } = req.body;
      const playlistWorker = this.buildPlaylistWorker();
      const result = await playlistWorker.createPlaylist(user.id, url);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public deletePlaylist = async (
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ): Promise<void> => {
    try {
      const { user } = req.body;
      const { playlistId } = req.params;
      const playlistWorker = this.buildPlaylistWorker();
      const result = await playlistWorker.deletePlaylist(user.id, playlistId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export { PlaylistController };
