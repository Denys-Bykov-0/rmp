import express from 'express';
import pg from 'pg';

import { UserWorker } from '@src/business/userWorker';
import { PlaylistController } from '@src/controllers/playlistController';
import { FileRepository, UserInfoAgent, UserRepository } from '@src/data';
import { Config } from '@src/entities/config';
import { auth0Middleware, userManagementMiddleware } from '@src/middlewares';
import { PluginManager } from '@src/pluginManager';
import { SQLManager } from '@src/sqlManager';

import { BaseRoute } from './baseRoute';
import { DEBUG, GENERAL } from './permissions';

export class PlaylistRoute extends BaseRoute {
  constructor(
    app: express.Application,
    config: Config,
    dbPool: pg.Pool,
    sqlManager: SQLManager,
    pluginManager?: PluginManager
  ) {
    super(app, 'PlaylistRoute', config, dbPool, sqlManager, pluginManager);
  }

  configureRoutes() {
    const controller: PlaylistController = new PlaylistController(
      this.config,
      this.dbPool,
      this.sqlManager,
      this.pluginManager
    );
    const playlistURI = `/up-vibe/v1/playlists`;
    const userWorker = new UserWorker(
      new UserRepository(this.dbPool, this.sqlManager),
      new FileRepository(this.dbPool, this.sqlManager),
      new UserInfoAgent(this.config)
    );

    this.app.get(
      `${playlistURI}`,
      auth0Middleware(this.config),
      this.config.appDebug
        ? userManagementMiddleware([GENERAL, DEBUG], userWorker, this.config)
        : userManagementMiddleware([GENERAL], userWorker, this.config),
      controller.getPlaylistsByUser
    );

    this.app.get(
      `${playlistURI}/:playlistId`,
      auth0Middleware(this.config),
      this.config.appDebug
        ? userManagementMiddleware([GENERAL, DEBUG], userWorker, this.config)
        : userManagementMiddleware([GENERAL], userWorker, this.config),
      controller.getPlaylistsByPlaylistId
    );

    this.app.post(
      `${playlistURI}`,
      auth0Middleware(this.config),
      this.config.appDebug
        ? userManagementMiddleware([GENERAL, DEBUG], userWorker, this.config)
        : userManagementMiddleware([GENERAL], userWorker, this.config),
      controller.createPlaylist
    );

    this.app.delete(
      `${playlistURI}`,
      auth0Middleware(this.config),
      this.config.appDebug
        ? userManagementMiddleware([GENERAL, DEBUG], userWorker, this.config)
        : userManagementMiddleware([GENERAL], userWorker, this.config),
      controller.deletePlaylist
    );

    return this.app;
  }
}
