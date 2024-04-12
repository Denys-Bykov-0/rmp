import Express from 'express';
import pg from 'pg';

import { TagMappingWorker } from '@src/business/tagMappingWorker';
import { TagMappingRepository } from '@src/data';
import { Config } from '@src/entities/config';
import { TagMapping } from '@src/entities/tagMapping';
import { PluginManager } from '@src/pluginManager';
import { SQLManager } from '@src/sqlManager';

import { BaseController } from './baseController';

class TagMappingController extends BaseController {
  constructor(
    config: Config,
    databasePool: pg.Pool,
    sqlManager: SQLManager,
    pluginManager?: PluginManager
  ) {
    super(config, databasePool, sqlManager, pluginManager);
  }

  private buildTagMappingWorker = (): TagMappingWorker => {
    return new TagMappingWorker(
      new TagMappingRepository(this.databasePool, this.sqlManager)
    );
  };

  public getTagMappingPriority = async (
    request: Express.Request,
    response: Express.Response,
    next: Express.NextFunction
  ): Promise<Express.Response | void> => {
    try {
      // FIXME: This is not implemented yet
      // const { user } = request.body;
      // const tagMappingWorker = this.buildTagMappingWorker();
      // const tagMappingPriority = await tagMappingWorker.getTagMappingPriority(
      //   user.id
      // );
      // return response.status(200).json(tagMappingPriority);
      return response.status(500).json({ error: 'Not implemented yet' });
    } catch (error) {
      next(error);
    }
  };

  public updateTagMappingPriority = async (
    request: Express.Request,
    response: Express.Response,
    next: Express.NextFunction
  ): Promise<Express.Response | void> => {
    try {
      // FIXME: This is not implemented yet
      // const { user } = request.body;
      // const mapping = new TagMappingPriority(
      //   request.body.title,
      //   request.body.artist,
      //   request.body.album,
      //   request.body.picture,
      //   request.body.year,
      //   request.body.trackNumber
      // );
      // const tagMappingWorker = this.buildTagMappingWorker();
      // const result = await tagMappingWorker.updateTagMappingPriority(
      //   mapping,
      //   user.id
      // );
      // return response.status(200).json(result);
      return response.status(500).json({ error: 'Not implemented yet' });
    } catch (error) {
      next(error);
    }
  };

  public updateTagMapping = async (
    request: Express.Request,
    response: Express.Response,
    next: Express.NextFunction
  ): Promise<Express.Response | void> => {
    try {
      const fileId = request.params.fileId;

      if (Object.keys(request.body).length == 0) {
        return response.status(400).json({ error: 'Request body is empty' });
      }
      if (request.body.title === undefined) {
        return response.status(400).json({ error: 'Title is required' });
      }
      if (request.body.artist === undefined) {
        return response.status(400).json({ error: 'Artist is required' });
      }
      if (request.body.album === undefined) {
        return response.status(400).json({ error: 'Album is required' });
      }
      if (request.body.picture === undefined) {
        return response.status(400).json({ error: 'Picture is required' });
      }
      if (request.body.year === undefined) {
        return response.status(400).json({ error: 'Year is required' });
      }
      if (request.body.trackNumber === undefined) {
        return response.status(400).json({ error: 'Track number is required' });
      }

      const tagMapping = new TagMapping(
        request.body.title,
        request.body.artist,
        request.body.album,
        request.body.picture,
        request.body.year,
        request.body.trackNumber
      );
      const tagMappingWorker = this.buildTagMappingWorker();
      const result = await tagMappingWorker.updateTagMapping(
        tagMapping,
        fileId
      );
      return response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export { TagMappingController };
