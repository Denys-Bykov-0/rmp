import { ShortTagDTO } from '@dtos/shortTagDTO';
import { TagDTO } from '@dtos/tagDTO';
import { TagMappingDTO } from '@dtos/tagMappingDTO';
import { TagDatabase } from '@interfaces/tagDatabase';
import { Logger } from 'log4js';
import pg from 'pg';
import { SQLManager } from '@core/sqlManager';

export class TagRepository implements TagDatabase {
  public dbPool: pg.Pool;
  public sqlManager: SQLManager;
  public logger: Logger;

  constructor(dbPool: pg.Pool, sqlManager: SQLManager, logger: Logger) {
    this.dbPool = dbPool;
    this.sqlManager = sqlManager;
    this.logger = logger;
  }

  public getFileTags = async (fileId: string): Promise<Array<TagDTO>> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getFileTags');
      this.logger.debug(query);
      const queryResult = await client.query(query, [fileId]);
      return queryResult.rows.map((row) => {
        return TagDTO.fromJSON(row);
      });
    } catch (err) {
      this.logger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public getTag = async (id: string): Promise<TagDTO | null> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getTag');
      this.logger.debug(query);
      const queryResult = await client.query(query, [id]);
      if (queryResult.rows.length > 0) {
        const result = TagDTO.fromJSON(queryResult.rows[0]);
        return result;
      } else {
        return null;
      }
    } catch (err) {
      this.logger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public getTagByFile = async (
    fileId: string,
    sourceId: string,
  ): Promise<TagDTO | null> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getTagByFile');
      this.logger.debug(query);
      const queryResult = await client.query(query, [fileId, sourceId]);
      if (queryResult.rows.length > 0) {
        const result = TagDTO.fromJSON(queryResult.rows[0]);
        return result;
      } else {
        return null;
      }
    } catch (err) {
      this.logger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public insertTagMapping = async (
    tagMapping: TagMappingDTO,
  ): Promise<TagMappingDTO> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('insertTagMapping');
      const queryResult = await client.query(query, [
        tagMapping.userId,
        tagMapping.fileId,
        tagMapping.title,
        tagMapping.artist,
        tagMapping.album,
        tagMapping.picture,
        tagMapping.year,
        tagMapping.trackNumber,
      ]);
      return TagMappingDTO.fromJSON(queryResult.rows[0]);
    } catch (err) {
      this.logger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public insertTag = async (tag: TagDTO): Promise<TagDTO> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('insertTag');
      const queryResult = await client.query(query, [
        tag.fileId,
        tag.isPrimary,
        tag.source,
        tag.status,
        tag.title,
        tag.artist,
        tag.album,
        tag.year,
        tag.trackNumber,
        tag.picturePath,
      ]);
      return TagDTO.fromJSON(queryResult.rows[0]);
    } catch (err) {
      this.logger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public getPrimaryTag = async (fileId: string): Promise<TagDTO | null> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getPrimaryTag');
      this.logger.debug(query);
      const queryResult = await client.query(query, [fileId]);
      if (queryResult.rows.length > 0) {
        return TagDTO.fromJSON(queryResult.rows[0]);
      }
      return null;
    } catch (err) {
      this.logger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public getTagMapping = async (
    userId: string,
    fileId: string,
  ): Promise<TagMappingDTO | null> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getTagMapping');
      this.logger.debug(query);
      const queryResult = await client.query(query, [userId, fileId]);
      if (queryResult.rows.length > 0) {
        return TagMappingDTO.fromJSON(queryResult.rows[0]);
      }
      return null;
    } catch (err) {
      this.logger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public getMappedTag = async (
    fileId: string,
    userId: string,
  ): Promise<ShortTagDTO> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getMappedTag');
      this.logger.debug(query);
      const queryResult = await client.query(query, [fileId, userId]);
      if (queryResult.rows.length > 0) {
        return ShortTagDTO.fromJSON(queryResult.rows[0]);
      }
      throw new Error('No tag found');
    } catch (err) {
      this.logger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };
}
