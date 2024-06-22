import Express from 'express';
import fs from 'fs/promises';
import path from 'path';
import pg from 'pg';
import sharp from 'sharp';
import { v4 as randomUUIDV4 } from 'uuid';

import { TagWorker } from '@src/business/tagWorker';
import { FileRepository, SourceRepository, TagRepository } from '@src/data';
import { UserDTO } from '@src/dtos/userDTO';
import { Config } from '@src/entities/config';
import { ShortTags } from '@src/entities/file';
import { PluginManager } from '@src/pluginManager';
import { SQLManager } from '@src/sqlManager';

import { BaseController } from './baseController';

class TagController extends BaseController {
  constructor(
    config: Config,
    dbPool: pg.Pool,
    sqlManager: SQLManager,
    pluginManager?: PluginManager
  ) {
    super(config, dbPool, sqlManager, pluginManager);
  }

  private buildTagWorker = (): TagWorker => {
    return new TagWorker(
      new TagRepository(this.dbPool, this.sqlManager),
      new FileRepository(this.dbPool, this.sqlManager),
      new SourceRepository(this.dbPool, this.sqlManager),
      this.pluginManager!.getTagPlugin()
    );
  };

  public getFileTags = async (
    request: Express.Request,
    response: Express.Response,
    next: Express.NextFunction
  ) => {
    try {
      const tagWorker = this.buildTagWorker();

      const fileId = request.params.fileId;
      const result = await tagWorker.getFileTags(fileId);
      return response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public getPictureOfTag = async (
    request: Express.Request,
    response: Express.Response,
    next: Express.NextFunction
  ) => {
    try {
      const tagWorker = this.buildTagWorker();

      const tagId = request.params.tagId;
      const result = await tagWorker.getPictureOfTag(tagId);
      return response.status(200).sendFile(result);
    } catch (error) {
      next(error);
    }
  };

  public parseTags = async (
    request: Express.Request,
    response: Express.Response,
    next: Express.NextFunction
  ) => {
    try {
      const tagWorker = this.buildTagWorker();

      const fileId = request.params.fileId;
      const result = await tagWorker.parseTags(fileId);
      return response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public addCustomTags = async (
    request: Express.Request,
    response: Express.Response,
    next: Express.NextFunction
  ) => {
    try {
      const tagWorker = this.buildTagWorker();

      const fileId = request.params.fileId;
      const userId = UserDTO.fromJSON(request.body.user).id;
      const customTags = new ShortTags(
        request.body.title,
        request.body.artist,
        request.body.album,
        request.body.year,
        request.body.trackNumber
      );
      const result = await tagWorker.addCustomTags(fileId, userId, customTags);
      return response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public addCustomTagPicture = async (
    request: Express.Request,
    response: Express.Response,
    next: Express.NextFunction
  ) => {
    try {
      const tagWorker = this.buildTagWorker();

      const fileId = request.params.fileId;
      const userId = UserDTO.fromJSON(request.body.user).id;

      const data = Array<Buffer>();
      request.on('data', (chunk) => {
        data.push(chunk);
      });

      request.on('end', async () => {
        const buffer = Buffer.concat(data);
        const { format } = await sharp(buffer).metadata();
        if (!format) {
          throw new Error('File format not supported');
        }
        const fileName = `${randomUUIDV4()}.${format}`;
        const filePath = path.join(this.config.appPathStorage, 'img', fileName);
        await fs.writeFile(filePath, buffer);

        const result = await tagWorker.addCustomTagPicture(
          fileId,
          userId,
          filePath
        );

        return response.status(200).json(result);
      });

      request.on('error', (error) => {
        return next(error);
      });
    } catch (error) {
      next(error);
    }
  };
}

export { TagController };
