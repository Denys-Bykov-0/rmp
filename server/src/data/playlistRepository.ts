import pg from 'pg';

import { PlaylistDTO } from '@src/dtos/playlistsDTO';
import { Status } from '@src/dtos/statusDTO';
import { UserPlaylistDTO } from '@src/dtos/userPlaylistDTO';
import { UserPlaylistFileDTO } from '@src/dtos/userPlaylistFileDTO';
import { iPlaylistDatabase } from '@src/interfaces/iPlaylistDatabase';
import { SQLManager } from '@src/sqlManager';
import { dataLogger } from '@src/utils/server/logger';

class PlaylistRepository implements iPlaylistDatabase {
  public dbPool: pg.Pool;
  public sqlManager: SQLManager;

  constructor(dbPool: pg.Pool, sqlManager: SQLManager) {
    this.dbPool = dbPool;
    this.sqlManager = sqlManager;
  }

  public insertUserPaylistFile = async (
    playlistId: string,
    fileId: string
  ): Promise<void> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('insertUserPaylistFile');
      dataLogger.debug(query);
      await client.query(query, [playlistId, fileId]);
    } catch (err) {
      dataLogger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public getDefaultUserPlaylistId = async (userId: string): Promise<string> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getDefaultUserPlaylistId');
      dataLogger.debug(query);
      const result = await client.query(query, [userId]);
      return result.rows[0].id;
    } catch (err) {
      dataLogger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public getUserPlaylistFile = async (
    fileId: string,
    userId: string
  ): Promise<UserPlaylistFileDTO | null> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getUserPlaylistFile');
      dataLogger.debug(query);
      const result = await client.query(query, [fileId, userId]);
      if (result.rows.length === 0) {
        return null;
      }
      return UserPlaylistFileDTO.fromJSON(result.rows[0]);
    } catch (err) {
      dataLogger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public getUserPlaylistFiles = async (
    userId: string,
    playlistId: string
  ): Promise<UserPlaylistFileDTO[] | null> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getUserPlaylistFiles');
      dataLogger.debug(query);
      const result = await client.query(query, [userId, playlistId]);
      const { rows } = result;
      if (rows.length === 0) {
        return null;
      }
      return rows.map((row) => UserPlaylistFileDTO.fromJSON(row));
    } catch (err) {
      dataLogger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public getPlaylistsByUserId = async (
    userId: string
  ): Promise<PlaylistDTO[]> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getPlaylistsByUserId');
      dataLogger.debug(query);
      const result = await client.query(query, [userId]);
      return result.rows.map((row) => PlaylistDTO.fromJSON(row));
    } catch (err) {
      dataLogger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public getPlaylistsByPlaylistId = async (
    userId: string,
    playlistId: string
  ): Promise<PlaylistDTO> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getPlaylistsByPlaylistId');
      dataLogger.debug(query);
      const result = await client.query(query, [userId, playlistId]);
      return PlaylistDTO.fromJSON(result.rows[0]);
    } catch (err) {
      dataLogger.error(err);
      throw new Error('playlist not found');
    } finally {
      client.release();
    }
  };

  public getPlaylistBySourceUrl = async (
    sourceUrl: string
  ): Promise<PlaylistDTO | null> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getPlaylistBySourceUrl');
      dataLogger.debug(query);
      const result = await client.query(query, [sourceUrl]);
      if (result.rows.length === 0) {
        return null;
      }
      return PlaylistDTO.fromJSON(result.rows[0]);
    } catch (err) {
      dataLogger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public getUserPlaylistByUserId = async (
    userId: string,
    playlistId: string
  ): Promise<UserPlaylistDTO> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getUserPlaylistByUserId');
      dataLogger.debug(query);
      const result = await client.query(query, [userId, playlistId]);
      return UserPlaylistDTO.fromJSON(result.rows[0]);
    } catch (err) {
      dataLogger.error(err);
      throw new Error('playlist not found');
    } finally {
      client.release();
    }
  };

  public insertPlaylist = async (
    url: string,
    sourceId: string,
    status: Status
  ): Promise<PlaylistDTO> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('insertPlaylist');
      dataLogger.debug(query);
      const result = await client.query(query, [
        url,
        sourceId,
        new Date().toISOString(),
        status,
      ]);
      return PlaylistDTO.fromJSON(result.rows[0]);
    } catch (err) {
      dataLogger.error(err);
      throw new Error('playlist not found');
    } finally {
      client.release();
    }
  };

  public insertUserPlaylist = async (
    userId: string,
    playlistId: string
  ): Promise<UserPlaylistDTO> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('insertUserPlaylist');
      dataLogger.debug(query);
      const result = await client.query(query, [
        userId,
        playlistId,
        new Date().toISOString(),
      ]);
      return UserPlaylistDTO.fromJSON(result.rows[0]);
    } catch (err) {
      dataLogger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public deleteUserPlaylistsFile = async (
    fileId: string,
    userId: string,
    playlistIds: Array<string>
  ): Promise<void> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('deleteUserPlaylistsFile');
      dataLogger.debug(query);
      await client.query(query, [fileId, userId, [playlistIds]]);
    } catch (err) {
      dataLogger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public deletePlaylist = async (playlistId: string): Promise<void> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('deletePlaylist');
      dataLogger.debug(query);
      await client.query(query, [playlistId]);
    } catch (err) {
      dataLogger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public deleteUserPlaylist = async (playlistId: string): Promise<void> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('deleteUserPlaylist');
      dataLogger.debug(query);
      await client.query(query, [playlistId]);
    } catch (err) {
      dataLogger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public getUserPlaylistFilesByPlaylistId = async (
    playlistId: string
  ): Promise<UserPlaylistFileDTO[]> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery(
        'getUserPlaylistFilesByPlaylistId'
      );
      dataLogger.debug(query);
      const result = await client.query(query, [playlistId]);
      return result.rows.map((row) => UserPlaylistFileDTO.fromJSON(row));
    } catch (err) {
      dataLogger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public getUserPlaylistById = async (
    id: string
  ): Promise<UserPlaylistDTO[]> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getUserPlaylistById');
      dataLogger.debug(query);
      const result = await client.query(query, [id]);
      const { rows } = result;
      return rows.map((row) => UserPlaylistDTO.fromJSON(row));
    } catch (err) {
      dataLogger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public deletePlaylists = async (playlistId: string): Promise<void> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('deletePlaylists');
      dataLogger.debug(query);
      await client.query(query, [playlistId]);
    } catch (err) {
      dataLogger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };
}

export { PlaylistRepository };
