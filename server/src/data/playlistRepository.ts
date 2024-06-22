import pg from 'pg';

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

  public insertUserPaylistFiles = async (
    playlistId: string,
    fileId: string
  ): Promise<void> => {
    const client = await this.dbPool.connect();
    try {
      const query = this.sqlManager.getQuery('insertUserPaylistFiles');
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
}

export { PlaylistRepository };
