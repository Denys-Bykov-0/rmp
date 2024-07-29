import dotenv from 'dotenv';
import express, { Application } from 'express';
import fs from 'fs';
import http2 from 'http2';
import http2Express from 'http2-express-bridge';
import pg from 'pg';

import { Config } from '@src/entities/config';
import {
  auth0ErrorHandlingMiddleware,
  errorHandlingMiddleware,
  requestLoggerMiddleware,
  unmatchedRoutesMiddleware,
} from '@src/middlewares';
import { PluginManager } from '@src/pluginManager';
import {
  APIRoute,
  BaseRoute,
  FileRoute,
  PlaylistRoute,
  SourceRoute,
  TagMappingRoute,
  TagRoute,
} from '@src/routes';
import { SQLManager } from '@src/sqlManager';
import { dataLogger, serverLogger } from '@src/utils/server/logger';
import { parseJSONConfig } from '@src/utils/server/parseJSONConfig';

export class App {
  private readonly app: Application;
  private routes: Array<BaseRoute> = [];
  private config: Config;
  private dbPool: pg.Pool;
  private sqlManager: SQLManager;
  private pluginManager: PluginManager;

  constructor() {
    this.app = http2Express(express);
    const env = dotenv.config({ path: 'config/.env' }).parsed || {};
    const configJson = parseJSONConfig(
      JSON.parse(fs.readFileSync('config/config.json', 'utf-8'))
    );
    this.config = new Config(env, configJson);
    this.dbPool = this.createPGPool(this.config);
    this.sqlManager = new SQLManager(dataLogger, serverLogger);
    this.pluginManager = new PluginManager(
      this.config,
      dataLogger,
      serverLogger
    );
  }

  public getApp(): Application {
    return this.app;
  }

  public getRoutes(): Array<BaseRoute> {
    return this.routes;
  }

  private createPGPool = (config: Config): pg.Pool => {
    return new pg.Pool({
      user: config.dbUser,
      host: config.dbHost,
      database: config.dbName,
      port: config.dbPort,
      password: config.dbPassword,
      max: config.dbMax,
    });
  };

  public init = async () => {
    await this.pluginManager.setUp();
    this.sqlManager.setUp();

    this.app.use(requestLoggerMiddleware);
    this.app.use(express.json());

    this.routes.push(
      new APIRoute(this.app, this.config, this.dbPool, this.sqlManager)
    );

    this.routes.push(
      new FileRoute(
        this.app,
        this.config,
        this.dbPool,
        this.sqlManager,
        this.pluginManager
      )
    );

    this.routes.push(
      new TagRoute(
        this.app,
        this.config,
        this.dbPool,
        this.sqlManager,
        this.pluginManager
      )
    );

    this.routes.push(
      new SourceRoute(
        this.app,
        this.config,
        this.dbPool,
        this.sqlManager,
        this.pluginManager
      )
    );

    this.routes.push(
      new TagMappingRoute(
        this.app,
        this.config,
        this.dbPool,
        this.sqlManager,
        this.pluginManager
      )
    );

    this.routes.push(
      new PlaylistRoute(
        this.app,
        this.config,
        this.dbPool,
        this.sqlManager,
        this.pluginManager
      )
    );

    this.app.use(auth0ErrorHandlingMiddleware);
    this.app.use(errorHandlingMiddleware);
    this.app.use(unmatchedRoutesMiddleware);
  };

  public run = () => {
    if (this.config.appPort == undefined || this.config.appHost == undefined) {
      serverLogger.error('appPort and appHost are not defined');
      throw new Error('appPort and appHost are not defined');
    }
    serverLogger.info(
      'Mode of operation: %s',
      this.config.appDebug ? 'DEBUG' : 'PRODUCTION'
    );
    if (this.config.appUseHttps) {
      const httpsOptions = {
        key: fs.readFileSync(this.config.appHttpsKey),
        cert: fs.readFileSync(this.config.appHttpsCert),
      };
      http2
        .createSecureServer(httpsOptions, this.app)
        .listen(this.config.appPort, this.config.appHost, () => {
          this.routes.forEach((route) => {
            serverLogger.info(`Routes configured for ${route.getName()}`);
          });
          serverLogger.info(
            `Server is running at https://${this.config.appHost}:${this.config.appPort}`
          );
        });
    } else {
      this.app.listen(this.config.appPort, this.config.appHost, () => {
        this.routes.forEach((route) => {
          serverLogger.info(`Routes configured for ${route.getName()}`);
        });
        serverLogger.info(
          `Server is running at http://${this.config.appHost}:${this.config.appPort}`
        );
      });
    }
  };
}
