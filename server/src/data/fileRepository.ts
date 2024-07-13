import pg from 'pg';

import { FileDTO } from '@src/dtos/fileDTO';
import { FileSynchronizationDTO } from '@src/dtos/fileSynchronizationDTO';
import { TaggedFileDTO } from '@src/dtos/taggedFileDTO';
import { UpdateFileSynchronizationDTO } from '@src/dtos/updateFileSynchronizationDTO';
import { UserDTO } from '@src/dtos/userDTO';
import { UserFileDTO } from '@src/dtos/userFileDTO';
import { iFileDatabase } from '@src/interfaces/iFileDatabase';
import { SQLManager } from '@src/sqlManager';
import { dataLogger } from '@src/utils/server/logger';

export class FileRepository implements iFileDatabase {
  public dbPool: pg.Pool;
  public sqlManager: SQLManager;

  constructor(dbPool: pg.Pool, sqlManager: SQLManager) {
    this.dbPool = dbPool;
    this.sqlManager = sqlManager;
  }

  public getFileByUrl = async (url: string): Promise<FileDTO | null> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getFileByUrl');
      dataLogger.debug(query);
      const queryResult = await client.query(query, [url]);
      if (queryResult.rows.length > 0) {
        const result = FileDTO.fromJSON(queryResult.rows[0]);
        return result;
      } else {
        return null;
      }
    } catch (err) {
      dataLogger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public getTaggedFileByUrl = async (
    url: string,
    user: UserDTO
  ): Promise<TaggedFileDTO | null> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getTaggedFileByUrl');
      dataLogger.debug(query);
      const queryResult = await client.query(query, [url, user.id]);
      const { rows } = queryResult;
      return rows.length > 0 ? TaggedFileDTO.fromJSON(rows[0]) : null;
    } catch (err) {
      dataLogger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public extendGetTaggedFilesByUser = (
    query: string,
    statuses: Array<string> | null,
    synchronized: boolean | null,
    playlists: Array<string> | null
  ): string => {
    let paramIndex = 3;

    const appendInClause = (
      query: string,
      items: Array<string>,
      paramName: string
    ): string => {
      if (items.length > 0) {
        const placeholders = items
          .map((_, index) => `$${paramIndex + index}`)
          .join(', ');
        query += ` AND ${paramName} IN (${placeholders})`;
        paramIndex += items.length;
      }
      return query;
    };

    if (statuses !== null) {
      query = appendInClause(query, statuses, 'f.status');
    }

    if (synchronized !== null) {
      query += ` AND fs.is_synchronized = $${paramIndex}`;
      paramIndex++;
    }

    if (playlists !== null) {
      query = appendInClause(query, playlists, 'p.id');
    }

    return query;
  };

  public formGetTaggedFilesByUserParametersList = (
    user: UserDTO,
    deviceId: string,
    statuses: Array<string> | null,
    synchronized: boolean | null,
    playlists: Array<string> | null
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: Array<any> = [user.id, deviceId];
    if (statuses !== null) {
      params.push(...statuses);
    }
    if (synchronized !== null) {
      params.push(synchronized);
    }
    if (playlists !== null) {
      params.push(...playlists);
    }
    return params;
  };

  public getTaggedFilesByUser = async (
    user: UserDTO,
    deviceId: string,
    statuses: Array<string> | null,
    synchronized: boolean | null,
    playlists: Array<string> | null
  ): Promise<Array<TaggedFileDTO>> => {
    const client = await this.dbPool.connect();
    try {
      let query = this.extendGetTaggedFilesByUser(
        this.sqlManager.getQuery('getTaggedFilesByUser'),
        statuses,
        synchronized,
        playlists
      );
      query = this.extendGroupRequest(query);

      dataLogger.debug(query);
      const queryResult = await client.query(
        query,
        this.formGetTaggedFilesByUserParametersList(
          user,
          deviceId,
          statuses,
          synchronized,
          playlists
        )
      );
      const { rows } = queryResult;
      return rows.map((row) => TaggedFileDTO.fromJSON(row));
    } catch (err) {
      dataLogger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public extendGroupRequest = (query: string): string => {
    return `${query} GROUP BY f.id, s.id, s.description,
            s.allow_for_secondary_tag_parsing, s.logo_path,
            f.status, f.source_url, fs.is_synchronized,
            tm.title, tm.artist, tm.album, tm.year,
            tm.track_number, tm.picture`;
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
      dataLogger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public insertUserFile = async (
    userId: string,
    fileId: string
  ): Promise<string> => {
    const client = await this.dbPool.connect();
    try {
      const query =
        'INSERT INTO user_files (user_id, file_id) VALUES ($1, $2) RETURNING id';
      const queryResult = await client.query(query, [userId, fileId]);
      if (queryResult.rows.length === 0) {
        throw new Error('Failed to insert user file');
      }
      return queryResult.rows[0].id;
    } catch (err) {
      dataLogger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public doesFileExist = async (fileId: string): Promise<boolean> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('doesFileExist');
      dataLogger.debug(query);
      const queryResult = await client.query(query, [fileId]);
      return queryResult.rows.length > 0;
    } catch (err) {
      dataLogger.error(`FilesRepository.doesFileExist: ${err}`);
      throw err;
    } finally {
      client.release();
    }
  };

  public getUserFile = async (
    userId: string,
    fileId: string
  ): Promise<UserFileDTO | null> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getUserFile');
      dataLogger.debug(query);
      const queryResult = await client.query(query, [userId, fileId]);
      if (queryResult.rows.length === 0) {
        return null;
      }
      return UserFileDTO.fromJSON(queryResult.rows[0]);
    } catch (err) {
      dataLogger.error(`FilesRepository.getUserFileExist: ${err}`);
      throw err;
    } finally {
      client.release();
    }
  };

  public getTaggedFile = async (
    id: string,
    deviceId: string,
    userId: string
  ): Promise<TaggedFileDTO | null> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getTaggedFile');
      dataLogger.debug(query);
      const queryResult = await client.query(query, [id, deviceId, userId]);
      const { rows } = queryResult;
      return rows.length > 0 ? TaggedFileDTO.fromJSON(rows[0]) : null;
    } catch (err) {
      throw new Error(`FilesRepository.getTaggedFile: ${err}`);
    } finally {
      client.release();
    }
  };

  public insertSynchronizationRecordsByUser = async (
    userId: string,
    userFileId: string
  ): Promise<void> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery(
        'insertSynchronizationRecordsByUser'
      );
      dataLogger.debug(query);
      await client.query(query, [userId, userFileId]);
    } catch (err) {
      throw new Error(
        `FilesRepository.insertSynchronizationRecordsByUser: ${err}`
      );
    } finally {
      client.release();
    }
  };

  public getUserFiles = async (
    userId: string,
    fileId: string
  ): Promise<Array<string>> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getUserFiles');
      dataLogger.debug(query);
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
      dataLogger.debug(query);
      const queryResult = await client.query(query, [userId]);
      return queryResult.rows.map((row) => row.file_id);
    } catch (err) {
      throw new Error(`FilesRepository.getUserFileIds: ${err}`);
    } finally {
      client.release();
    }
  };

  public updateSynchronizationRecords = async (
    fileSynchronization: UpdateFileSynchronizationDTO
  ): Promise<void> => {
    const client = await this.dbPool.connect();
    try {
      let query = this.sqlManager.getQuery('updateSynchronizationRecords');
      const parameters = [
        fileSynchronization.timestamp,
        fileSynchronization.userFileId,
        fileSynchronization.isSynchronized,
      ];
      if (fileSynchronization.wasChanged) {
        query += ' AND was_changed = $' + (parameters.length + 1);
        parameters.push(fileSynchronization.wasChanged);
      }
      if (fileSynchronization.deviceId) {
        query += ' AND device_id = $' + (parameters.length + 1);
        parameters.push(fileSynchronization.deviceId);
      }
      dataLogger.debug(query);
      await client.query(query, parameters);
    } catch (err) {
      throw new Error(`FilesRepository.updateSynchronizationRecords: ${err}`);
    } finally {
      client.release();
    }
  };

  public getFile = async (id: string): Promise<FileDTO | null> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getFile');
      dataLogger.debug(query);
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
    userFileId: string
  ): Promise<void> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery(
        'inserSyncrhonizationRecordsByDevice'
      );
      dataLogger.debug(query);
      await client.query(query, [deviceId, userFileId]);
    } catch (err) {
      throw new Error(
        `FilesRepository.inserSyncrhonizationRecordsByDevice: ${err}`
      );
    } finally {
      client.release();
    }
  };

  public getUserFileRecord = async (
    fileId: string,
    userId: string
  ): Promise<UserFileDTO | null> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getUserFileRecord');
      dataLogger.debug(query);
      const queryResult = await client.query(query, [fileId, userId]);
      if (queryResult.rows.length === 0) {
        return null;
      }
      return UserFileDTO.fromJSON(queryResult.rows[0]);
    } catch (err) {
      throw new Error(`FilesRepository.getUserFileRecord: ${err}`);
    } finally {
      client.release();
    }
  };

  public getSyncrhonizationRecordsByDevice = async (
    deviceId: string,
    userFileId: string
  ): Promise<FileSynchronizationDTO> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery(
        'getSyncrhonizationRecordsByDevice'
      );
      dataLogger.debug(query);
      const queryResult = await client.query(query, [deviceId, userFileId]);
      if (queryResult.rows.length === 0) {
        throw new Error('Synchronization record not found');
      }
      return FileSynchronizationDTO.fromJSON(queryResult.rows[0]);
    } catch (err) {
      throw new Error(
        `FilesRepository.getSyncrhonizationRecordsByDevice: ${err}`
      );
    } finally {
      client.release();
    }
  };

  public deleteSyncrhonizationRecordsByDevice = async (
    deviceId: string,
    userFileId: string
  ): Promise<void> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery(
        'deleteSyncrhonizationRecordsByDevice'
      );
      dataLogger.debug(query);
      await client.query(query, [deviceId, userFileId]);
    } catch (err) {
      throw new Error(
        `FilesRepository.deleteSyncrhonizationRecordsByDevice: ${err}`
      );
    } finally {
      client.release();
    }
  };

  public getSyncrhonizationRecordsByUserFile = async (
    userFileId: string
  ): Promise<FileSynchronizationDTO | null> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery(
        'getSyncrhonizationRecordsByUserFile'
      );
      dataLogger.debug(query);
      const queryResult = await client.query(query, [userFileId]);
      const { rows } = queryResult;
      if (rows.length === 0) {
        return null;
      }
      return FileSynchronizationDTO.fromJSON(rows[0]);
    } catch (err) {
      throw new Error(
        `FilesRepository.getSyncrhonizationRecordsByUserFile: ${err}`
      );
    } finally {
      client.release();
    }
  };

  public deleteUserFile = async (userFileId: string): Promise<void> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('deleteUserFile');
      dataLogger.debug(query);
      await client.query(query, [userFileId]);
    } catch (err) {
      throw new Error(`FilesRepository.deleteUserFile: ${err}`);
    } finally {
      client.release();
    }
  };

  public getUserFilesByFileId = async (
    fileId: string
  ): Promise<Array<UserFileDTO>> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getUserFilesByFileId');
      dataLogger.debug(query);
      const queryResult = await client.query(query, [fileId]);
      return queryResult.rows.map((row) => UserFileDTO.fromJSON(row));
    } catch (err) {
      throw new Error(`FilesRepository.getUserFilesByFileId: ${err}`);
    } finally {
      client.release();
    }
  };

  public deleteFileById = async (fileId: string): Promise<void> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('deleteFileById');
      dataLogger.debug(query);
      await client.query(query, [fileId]);
    } catch (err) {
      throw new Error(`FilesRepository.deleteFileById: ${err}`);
    } finally {
      client.release();
    }
  };
}
