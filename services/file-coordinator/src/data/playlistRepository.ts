import { Logger } from 'log4js';
import pg from 'pg';
import { SQLManager } from '@core/sqlManager';
import { PlaylistDTO } from '@dtos/playlistsDTO';
import { TaggedUserPlaylistFileDTO } from '@dtos/taggedUserPlaylistFileDTO';
import { UserPlaylistDTO } from '@dtos/userPlaylistDTO';
import { UserPlaylistFileDTO } from '@dtos/userPlaylistFileDTO';
import { PlaylistDatabase } from '@interfaces/playlistDatabase';

class PlaylistRepository implements PlaylistDatabase {
  public dbPool: pg.Pool;
  public sqlManager: SQLManager;
  public logger: Logger;

  constructor(dbPool: pg.Pool, sqlManager: SQLManager, logger: Logger) {
    this.dbPool = dbPool;
    this.sqlManager = sqlManager;
    this.logger = logger;
  }

  public getUserPlaylistsByPlaylistId = async (
    playlistId: string,
  ): Promise<UserPlaylistDTO[]> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getUserPlaylistsByPlaylistId');
      this.logger.debug(`Query: ${query}`);
      const queryResult = await client.query(query, [playlistId]);
      const { rows } = queryResult;
      return rows.length > 0
        ? rows.map((row) => UserPlaylistDTO.fromJSON(row))
        : [];
    } catch (err) {
      this.logger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public getUserPlaylistFile = async (
    fileId: string,
    userId: string,
    playlistId: string,
  ): Promise<UserPlaylistFileDTO | null> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getUserPlaylistFile');
      this.logger.debug(`Query: ${query}`);
      const queryResult = await client.query(query, [
        fileId,
        userId,
        playlistId,
      ]);
      const { rows } = queryResult;
      if (rows.length === 0) {
        return null;
      }
      return UserPlaylistFileDTO.fromJSON(rows[0]);
    } catch (err) {
      this.logger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public insertUserPlaylistFile = async ({
    fileId,
    playlistId,
    missingFromRemote,
  }: {
    fileId: string;
    playlistId: string;
    missingFromRemote: boolean;
  }): Promise<void> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('insertUserPlaylistFile');
      this.logger.debug(`Query: ${query}`);
      await client.query(query, [fileId, playlistId, missingFromRemote]);
    } catch (err) {
      this.logger.error(err);
      throw err;
    } finally {
      client.release();
    }
  };

  public getPlaylistByPlaylistId = async (
    playlistId: string,
  ): Promise<PlaylistDTO | null> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('getPlaylistByPlaylistId');
      this.logger.debug(`Query: ${query}`);
      const queryResult = await client.query(query, [playlistId]);
      const { rows } = queryResult;
      return rows.length > 0 ? PlaylistDTO.fromJSON(rows[0]) : null;
    } catch (error) {
      this.logger.error(`Error getting playlists by playlist id: ${error}`);
      throw error;
    } finally {
      client.release();
    }
  };

  public getUserPlaylistFilesAndFileByPlaylistId = async (
    playlistId: string,
  ): Promise<TaggedUserPlaylistFileDTO[]> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery(
        'getUserPlaylistFilesAndFileByPlaylistId',
      );
      this.logger.debug(`Query: ${query}`);
      const queryResult = await client.query(query, [playlistId]);
      const { rows } = queryResult;
      return rows.map((row) => TaggedUserPlaylistFileDTO.fromJSON(row));
    } catch (error) {
      this.logger.error(
        `Error getting user playlist files and file by playlist id: ${error}`,
      );
      throw error;
    } finally {
      client.release();
    }
  };

  public updateUserPlaylistFile = async (
    fileId: string,
    missingFromRemote: boolean,
  ): Promise<void> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('updateUserPlaylistFile');
      this.logger.debug(`Query: ${query}`);
      await client.query(query, [fileId, missingFromRemote]);
    } catch (error) {
      this.logger.error(`Error updating user playlist file: ${error}`);
      throw error;
    } finally {
      client.release();
    }
  };
}

export { PlaylistRepository };
