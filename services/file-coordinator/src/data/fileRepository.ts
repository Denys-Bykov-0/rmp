import { Logger } from 'log4js';
import pg from 'pg';
import { SQLManager } from '@core/sqlManager';
import { FileDTO } from '@dtos/fileDTO';
import { TaggedFileDTO } from '@dtos/taggedFileDTO';
import { UserDTO } from '@dtos/userDTO';
import { FileDatabase } from '@interfaces/fileDatabase';

export class FileRepository implements FileDatabase {
  public dbPool: pg.Pool;
  public sqlManager: SQLManager;
  public logger: Logger;

  constructor(dbPool: pg.Pool, sqlManager: SQLManager, logger: Logger) {
    this.dbPool = dbPool;
    this.sqlManager = sqlManager;
    this.logger = logger;
  }

  public getFileByUrl = async (url: string): Promise<FileDTO | null> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getFileByUrl');
      this.logger.debug(query);
      const queryResult = await client.query(query, [url]);
      if (queryResult.rows.length > 0) {
        const result = FileDTO.fromJSON(queryResult.rows[0]);
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

  public getTaggedFileByUrl = async (
    url: string,
    user: UserDTO,
  ): Promise<TaggedFileDTO | null> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getTaggedFileByUrl');
      this.logger.debug(query);
      const queryResult = await client.query(query, [url, user.id]);
      if (queryResult.rows.length > 0) {
        const result = TaggedFileDTO.fromJSON(queryResult.rows[0]);
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

  public extendGetTaggedFilesByUser = (
    query: string,
    statuses: Array<string> | null,
    synchronized: boolean | null,
  ): string => {
    let paramIndex = 3;

    if (statuses !== null) {
      query += ' AND f.status IN (';
      for (let i = 0; i < statuses.length; i++) {
        query += `$${paramIndex}`;
        paramIndex++;
        if (i < statuses.length - 1) {
          query += ', ';
        }
      }
      query += ')';
    }
    if (synchronized !== null) {
      query += ` AND fs.is_synchronized = $${paramIndex}`;
      paramIndex++;
    }
    return query;
  };

  public formGetTaggedFilesByUserParametersList = (
    user: UserDTO,
    deviceId: string,
    statuses: Array<string> | null,
    synchronized: boolean | null,
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: Array<any> = [user.id, deviceId];
    if (statuses !== null) {
      params.push(...statuses);
    }
    if (synchronized !== null) {
      params.push(synchronized);
    }

    return params;
  };

  public getTaggedFilesByUser = async (
    user: UserDTO,
    deviceId: string,
    statuses: Array<string> | null,
    synchronized: boolean | null,
  ): Promise<Array<TaggedFileDTO>> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.extendGetTaggedFilesByUser(
        this.sqlManager.getQuery('getTaggedFilesByUser'),
        statuses,
        synchronized,
      );

      this.logger.debug(query);
      const queryResult = await client.query(
        query,
        this.formGetTaggedFilesByUserParametersList(
          user,
          deviceId,
          statuses,
          synchronized,
        ),
      );
      return queryResult.rows.map((row) => {
        return TaggedFileDTO.fromJSON(row);
      });
    } catch (err) {
      this.logger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public insertFile = async (file: FileDTO): Promise<FileDTO> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('insertFile');
      const queryResult = await client.query(query, [
        file.path,
        file.sourceUrl,
        file.source,
        file.status,
      ]);
      return FileDTO.fromJSON(queryResult.rows[0]);
    } catch (err) {
      this.logger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public insertUserFile = async (
    userId: string,
    fileId: string,
  ): Promise<string> => {
    const client = await this.dbPool.connect();
    try {
      const query =
        'INSERT INTO user_files (user_id, file_id) VALUES ($1, $2) RETURNING id';
      const queryResult = await client.query(query, [userId, fileId]);
      return queryResult.rows[0].id;
    } catch (err) {
      this.logger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public doesFileExist = async (fileId: string): Promise<boolean> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('doesFileExist');
      this.logger.debug(query);
      const queryResult = await client.query(query, [fileId]);
      return queryResult.rows.length > 0;
    } catch (err) {
      this.logger.error(`FilesRepository.doesFileExist: ${err}`);
      throw err;
    } finally {
      client.release();
    }
  };

  public doesUserFileExist = async (
    userId: string,
    fileId: string,
  ): Promise<boolean> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('doesUserFileExist');
      this.logger.debug(query);
      const queryResult = await client.query(query, [userId, fileId]);
      return queryResult.rows.length > 0;
    } catch (err) {
      this.logger.error(`FilesRepository.doesUserFileExist: ${err}`);
      throw err;
    } finally {
      client.release();
    }
  };

  public getTaggedFile = async (
    id: string,
    deviceId: string,
    userId: string,
  ): Promise<TaggedFileDTO | null> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getTaggedFile');
      this.logger.debug(query);
      const queryResult = await client.query(query, [id, deviceId, userId]);
      if (queryResult.rows.length === 0) {
        return null;
      }
      return TaggedFileDTO.fromJSON(queryResult.rows[0]);
    } catch (err) {
      throw new Error(`FilesRepository.getTaggedFile: ${err}`);
    } finally {
      client.release();
    }
  };

  public insertSynchronizationRecordsByUser = async (
    userId: string,
    userFileId: string,
  ): Promise<void> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery(
        'insertSynchronizationRecordsByUser',
      );
      await client.query(query, [userId, userFileId]);
    } catch (err) {
      throw new Error(
        `FilesRepository.insertSynchronizationRecordsByUser: ${err}`,
      );
    } finally {
      client.release();
    }
  };

  public getUserFiles = async (
    userId: string,
    fileId: string,
  ): Promise<Array<string>> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getUserFiles');
      const queryResult = await client.query(query, [userId, fileId]);
      return queryResult.rows.map((row) => row.id);
    } catch (err) {
      throw new Error(`FilesRepository.getUserFiles: ${err}`);
    } finally {
      client.release();
    }
  };

  public getUserFileIds = async (userId: string): Promise<Array<string>> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getUserFileIds');
      const queryResult = await client.query(query, [userId]);
      return queryResult.rows.map((row) => row.file_id);
    } catch (err) {
      throw new Error(`FilesRepository.getUserFileIds: ${err}`);
    } finally {
      client.release();
    }
  };

  public updateSynchronizationRecords = async (
    timestamp: string,
    userFileId: string,
  ): Promise<void> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('updateSynchronizationRecords');
      await client.query(query, [timestamp, userFileId]);
    } catch (err) {
      throw new Error(`FilesRepository.updateSynchronizationRecords: ${err}`);
    } finally {
      client.release();
    }
  };

  public confirmFile = async (
    fileId: string,
    userId: string,
    deviceId: string,
  ): Promise<void> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('confirmFile');
      await client.query(query, [
        fileId,
        userId,
        deviceId,
        new Date().toISOString(),
      ]);
    } catch (err) {
      throw new Error(`FilesRepository.confirmFile: ${err}`);
    } finally {
      client.release();
    }
  };

  public getFile = async (id: string): Promise<FileDTO | null> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getFile');
      const queryResult = await client.query(query, [id]);
      if (queryResult.rows.length === 0) {
        return null;
      }
      return FileDTO.fromJSON(queryResult.rows[0]);
    } catch (err) {
      throw new Error(`FilesRepository.getFile: ${err}`);
    } finally {
      client.release();
    }
  };

  public inserSyncrhonizationRecordsByDevice = async (
    deviceId: string,
    userFileId: string,
  ): Promise<void> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery(
        'inserSyncrhonizationRecordsByDevice',
      );
      await client.query(query, [deviceId, userFileId]);
    } catch (err) {
      throw new Error(
        `FilesRepository.inserSyncrhonizationRecordsByDevice: ${err}`,
      );
    } finally {
      client.release();
    }
  };
}
