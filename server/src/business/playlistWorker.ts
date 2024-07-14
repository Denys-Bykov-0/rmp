import { Status } from '@src/dtos/statusDTO';
import { UpdateFileSynchronizationDTO } from '@src/dtos/updateFileSynchronizationDTO';
import { Playlist } from '@src/entities/playlists';
import { iFileDatabase } from '@src/interfaces/iFileDatabase';
import { iFilePlugin } from '@src/interfaces/iFilePlugin';
import { iPlaylistDatabase } from '@src/interfaces/iPlaylistDatabase';
import { iPlaylistPlugin } from '@src/interfaces/iPlaylistPlugin';
import { iSourceDatabase } from '@src/interfaces/iSourceDatabase';
import { PlaylistMapper } from '@src/mappers/playlistMapper';

import { ProcessingError } from './processingError';

class PlaylistWorker {
  constructor(
    private readonly db: iPlaylistDatabase,
    private readonly fileDb: iFileDatabase,
    private readonly sourceDb: iSourceDatabase,
    private readonly filePlugin: iFilePlugin,
    private readonly playlistPlugin: iPlaylistPlugin
  ) {}

  public getPlaylistsByUserId = async (userId: string): Promise<Playlist[]> => {
    const result = await this.db.getPlaylistsByUserId(userId);
    return result.map((playlistDTO) =>
      new PlaylistMapper().toEntity(playlistDTO)
    );
  };

  public getPlaylistsByPlaylistId = async (
    userId: string,
    playlistId: string
  ): Promise<Playlist> => {
    const result = await this.db.getPlaylistsByPlaylistId(userId, playlistId);
    return new PlaylistMapper().toEntity(result);
  };

  public createPlaylist = async (
    userId: string,
    url: string
  ): Promise<Playlist> => {
    let normalizedUrl: string;
    try {
      normalizedUrl = this.filePlugin.normalizeUrlPlaylist(url);
    } catch (error) {
      throw new ProcessingError({
        message: 'Invalid URL',
      });
    }
    const existingPlaylist =
      await this.db.getPlaylistBySourceUrl(normalizedUrl);

    if (existingPlaylist) {
      if (await this.db.getUserPlaylistByUserId(userId, existingPlaylist.id)) {
        throw new ProcessingError({
          message: 'Playlist already exists',
        });
      }
    }

    const sourceId = await this.filePlugin.getSource(normalizedUrl);
    const result = await this.db.insertPlaylist(
      normalizedUrl,
      sourceId,
      Status.Created
    );
    const source = await this.sourceDb.getSource(sourceId);
    await this.playlistPlugin.parsePlaylist(result.id, source!.description);
    await this.db.insertUserPlaylist(userId, result.id);

    const palylist = await this.db.getPlaylistsByPlaylistId(userId, result.id);
    return new PlaylistMapper().toEntity(palylist);
  };

  public deletePlaylist = async (
    userId: string,
    playlistId: string
  ): Promise<void> => {
    const userPlaylist = await this.db.getUserPlaylistByUserId(
      userId,
      playlistId
    );
    const userPlaylistFiles = await this.db.getUserPlaylistFilesByPlaylistId(
      userPlaylist.id
    );

    userPlaylistFiles.forEach(async (file) => {
      await this.db.deleteUserPlaylistsFile(file.id, userId, [playlistId]);
      const fileSynchronization = UpdateFileSynchronizationDTO.fromJSON({
        timestamp: new Date().toISOString(),
        userFileId: file.fileId,
        isSynchronized: false,
      });
      await this.fileDb.updateSynchronizationRecords(fileSynchronization);
    });
    await this.db.deleteUserPlaylist(userId, userPlaylist.id);
    const playlists = await this.db.getUserPlaylistById(playlistId);
    if (playlists.length !== 0) {
      playlists.forEach(async (playlist) => {
        await this.db.deletePlaylist(playlist.id);
      });
    }
  };
}

export { PlaylistWorker };
