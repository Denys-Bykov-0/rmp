import { Logger } from 'log4js';
import pg from 'pg';
import { SQLManager } from '@core/sqlManager';
import { FileDTO } from '@dtos/fileDTO';
import { TagDTO } from '@dtos/tagDTO';
import { TagMappingDTO } from '@dtos/tagMappingDTO';
import { TagMappingPriorityDTO } from '@dtos/tagMappingPriorityDTO';
import { UpdateFileSynchronizationDTO } from '@dtos/updateFileSynchronizationDTO';
import { UserFileDTO } from '@dtos/userFileDTO';
import { FileCoordinatorDatabase } from '@interfaces/fileCoordinatorDatabase';

class FileCoordinatorRepository implements FileCoordinatorDatabase {
  private dbPool: pg.Pool;
  private sqlManager: SQLManager;
  private logger: Logger;
  constructor(dbPool: pg.Pool, sqlManager: SQLManager, logger: Logger) {
    this.dbPool = dbPool;
    this.sqlManager = sqlManager;
    this.logger = logger;
  }
  public getFileById = async (id: string): Promise<FileDTO> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getFileById');
      this.logger.debug(`Query: ${query}`);
      const queryResult = await client.query(query, [id]);
      return FileDTO.fromJSON(queryResult.rows[0]);
    } catch (error) {
      this.logger.error(`Error getting file by id: ${error}`);
      throw new Error(`Error getting file by id: ${error}`);
    } finally {
      client.release();
    }
  };

  public updateFileSynchronization = async (
    fileSynchronization: UpdateFileSynchronizationDTO,
  ): Promise<void> => {
    const client = await this.dbPool.connect();
    try {
      let query = this.sqlManager.getQuery('updateFileSynchronization');
      const parameters = [
        fileSynchronization.timestamp,
        fileSynchronization.userFileId,
      ];
      if (fileSynchronization.isSynchronized) {
        query = query + ` AND is_synchronized = ${parameters.length + 1}`;
        parameters.push(fileSynchronization.isSynchronized.toString());
      }
      if (fileSynchronization.wasChanged) {
        query = query + ` AND was_changed = ${parameters.length + 1}`;
        parameters.push(fileSynchronization.wasChanged.toString());
      }
      this.logger.debug(`Query: ${query}`);
      await client.query(query, parameters);
    } catch (error) {
      this.logger.error(`Error updating file synchronization: ${error}`);
      throw new Error(`Error updating file synchronization: ${error}`);
    } finally {
      client.release();
    }
  };

  public getTagMappings = async (
    fileId: string,
    fixed: boolean,
  ): Promise<TagMappingDTO[]> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getTagMappings');
      this.logger.debug(`Query: ${query}`);
      const { rows } = await client.query(query, [fileId, fixed]);
      return rows.map((row) => TagMappingDTO.fromJSON(row));
    } catch (error) {
      this.logger.error(`Error getting tags mapping by file id: ${fileId}`);
      throw error;
    } finally {
      client.release();
    }
  };

  public getTagMappingPriority = async (
    userId: string,
  ): Promise<TagMappingPriorityDTO> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getTagMappingPriority');
      const { rows } = await client.query(query, [userId]);
      return TagMappingPriorityDTO.fromJSON(rows);
    } catch (error) {
      this.logger.error(
        `Error getting tags mapping priority by user id: ${userId}`,
      );
      throw error;
    } finally {
      client.release();
    }
  };

  public updateTagMapping = async (
    tagMapping: TagMappingDTO,
  ): Promise<void> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('updateTagMapping');
      const values = [
        tagMapping.title,
        tagMapping.artist,
        tagMapping.album,
        tagMapping.picture,
        tagMapping.year,
        tagMapping.trackNumber,
        tagMapping.fixed,
        tagMapping.fileId,
      ];
      await client.query(query, values);
    } catch (error) {
      this.logger.error(`Error updating tag mapping: ${error}`);
      throw error;
    } finally {
      client.release();
    }
  };

  public getTagsByFileId = async (id: string): Promise<TagDTO[]> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getTagByFileId');
      const queryResult = await client.query(query, [id]);
      this.logger.debug(`Query: ${query}`);
      return queryResult.rows.map((row) => TagDTO.fromJSON(row));
    } catch (error) {
      this.logger.error(`Error getting tags by file id: ${error}`);
      throw new Error(`Error getting tags by file id: ${error}`);
    } finally {
      client.release();
    }
  };

  public getUserFileId = async (
    fileId: string,
    userId: string,
  ): Promise<string> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getUserFileId');
      const { rows } = await client.query(query, [fileId, userId]);
      return rows[0].id;
    } catch (error) {
      this.logger.error(`Error getting user file id by file id: ${error}`);
      throw error;
    } finally {
      client.release();
    }
  };

  public updateFileStatus = async (
    fileId: string,
    status: string,
  ): Promise<void> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('updateFileStatus');
      await client.query(query, [fileId, status]);
    } catch (error) {
      this.logger.error(`Error updating file status: ${error}`);
      throw error;
    } finally {
      client.release();
    }
  };

  public getFileByUrl = async (url: string): Promise<FileDTO | null> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getFileByUrl');
      this.logger.debug(`Query: ${query}`);
      const queryResult = await client.query(query, [url]);
      const { rows } = queryResult;
      return rows.length > 0 ? FileDTO.fromJSON(rows[0]) : null;
    } catch (err) {
      this.logger.error(`Error getting file by url: ${err}`);
      throw err;
    } finally {
      client.release();
    }
  };

  public insertFile = async (file: FileDTO): Promise<FileDTO> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('insertFile');
      this.logger.debug(`Query: ${query}`);
      const queryResult = await client.query(query, [
        file.path,
        file.sourceUrl,
        file.source,
        file.status,
      ]);
      const { rows } = queryResult;
      return FileDTO.fromJSON(rows[0]);
    } catch (err) {
      this.logger.error(`Error inserting file: ${err}`);
      throw err;
    } finally {
      client.release();
    }
  };

  public getUserFile = async (
    userId: string,
    fileId: string,
  ): Promise<UserFileDTO | null> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getUserFile');
      const { rows } = await client.query(query, [userId, fileId]);
      if (rows.length === 0) {
        return null;
      }
      return UserFileDTO.fromJSON(rows[0]);
    } catch (error) {
      this.logger.error(
        `Error getting user file by user id and file id: ${error}`,
      );
      throw error;
    } finally {
      client.release();
    }
  };

  public insertUserFile = async (
    userId: string,
    fileId: string,
  ): Promise<UserFileDTO> => {
    const client = await this.dbPool.connect();
    const timestamp = new Date().toISOString();
    try {
      const query = `INSERT INTO user_files (user_id, file_id, added_ts)
                     VALUES ($1, $2, $3)
                     RETURNING
                     id AS user_file_id,
                     file_id AS user_file_file_id,
                     user_id AS user_file_user_id,
                     added_ts AS user_file_added_ts`;
      this.logger.debug(`Query: ${query}`);
      const queryResult = await client.query(query, [
        userId,
        fileId,
        timestamp,
      ]);
      if (queryResult.rows.length === 0) {
        throw new Error('Failed to insert user file');
      }
      const { rows } = queryResult;
      return UserFileDTO.fromJSON(rows[0]);
    } catch (err) {
      this.logger.error(`Error inserting user file: ${err}`);
      throw err;
    } finally {
      client.release();
    }
  };

  public getDeviceIdsByUser = async (userId: string): Promise<string[]> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getDeviceIdsByUser');
      this.logger.debug(`Query: ${query}`);
      const queryResult = await client.query(query, [userId]);
      return queryResult.rows.map((row) => row.id);
    } catch (error) {
      this.logger.error(`Error getting devices id by user id: ${error}`);
      throw error;
    } finally {
      client.release();
    }
  };

  public insertSynchronizationRecordsByDevice = async (
    userFileId: string,
    deviceId: string,
  ): Promise<void> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery(
        'insertSynchronizationRecordsByDevice',
      );
      this.logger.debug(`Query: ${query}`);
      await client.query(query, [userFileId, deviceId]);
    } catch (error) {
      this.logger.error(
        `Error inserting synchronization records by user: ${error}`,
      );
      throw error;
    } finally {
      client.release();
    }
  };
}

export { FileCoordinatorRepository };
