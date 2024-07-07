import pg from 'pg';

import { TagMappingDTO } from '@src/dtos/tagMappingDTO';
import { TagMappingPriorityDTO } from '@src/dtos/tagMappingPriorityDTO';
import { iTagMappingDatabase } from '@src/interfaces/iTagMappingDatabase';
import { SQLManager } from '@src/sqlManager';
import { dataLogger } from '@src/utils/server/logger';

export class TagMappingRepository implements iTagMappingDatabase {
  public dbPool: pg.Pool;
  public sqlManager: SQLManager;

  constructor(dbPool: pg.Pool, sqlManager: SQLManager) {
    this.dbPool = dbPool;
    this.sqlManager = sqlManager;
  }

  public getTagMapping = async (fileId: string): Promise<TagMappingDTO> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getTagMapping');
      dataLogger.debug(query);
      const queryResult = await client.query(query, [fileId]);
      return TagMappingDTO.fromJSON(queryResult.rows[0]);
    } catch (err) {
      dataLogger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public updateTagMapping = async (
    tagMapping: TagMappingDTO,
    fileId: string
  ): Promise<TagMappingDTO> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('updateTagMapping');
      dataLogger.debug(query);
      const queryResult = await client.query(query, [
        tagMapping.title,
        tagMapping.artist,
        tagMapping.album,
        tagMapping.picture,
        tagMapping.year,
        tagMapping.trackNumber,
        tagMapping.fixed,
        fileId,
      ]);
      const { rows } = queryResult;
      return TagMappingDTO.fromJSON(rows[0]);
    } catch (err) {
      dataLogger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public getTagMappingPriority = async (
    userId: string
  ): Promise<TagMappingPriorityDTO | null> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getTagMappingPriority');
      dataLogger.debug(query);
      const queryResult = await client.query(query, [userId]);
      if (queryResult.rows.length === 0) {
        return null;
      }
      return TagMappingPriorityDTO.fromJSON(queryResult.rows);
    } catch (err) {
      dataLogger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public updateTagMappingPriority = async (
    tagMappingPriority: TagMappingPriorityDTO
  ): Promise<TagMappingPriorityDTO> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('updateTagMappingPriority');
      dataLogger.debug(query);
      const queryResults: JSON.JSONObject[] = [];
      for (let index = 0; index < tagMappingPriority.title.length; index++) {
        const queryResult = await client.query(query, [
          tagMappingPriority.title[index],
          tagMappingPriority.artist[index],
          tagMappingPriority.album[index],
          tagMappingPriority.picture[index],
          tagMappingPriority.year[index],
          tagMappingPriority.trackNumber[index],
          tagMappingPriority.userId,
          index + 1,
        ]);
        queryResults.push(queryResult.rows[0]);
      }
      return TagMappingPriorityDTO.fromJSON(queryResults);
    } catch (err) {
      dataLogger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };
}
