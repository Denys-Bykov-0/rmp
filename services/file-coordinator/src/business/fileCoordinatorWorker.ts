import { randomUUID as randomUUIDV4 } from 'crypto';
import { Logger } from 'log4js';
import { FileDTO } from '@dtos/fileDTO';
import { TagDTO } from '@dtos/tagDTO';
import { TagMappingDTO } from '@dtos/tagMappingDTO';
import { TagMappingPriorityDTO } from '@dtos/tagMappingPriorityDTO';
import { UpdateFileSynchronizationDTO } from '@dtos/updateFileSynchronizationDTO';
import { Status } from '@entities/status';
import { FileCoordinatorDatabase } from '@interfaces/fileCoordinatorDatabase';
import { FilePlugin } from '@interfaces/filePlugin';
import { PlaylistDatabase } from '@interfaces/playlistDatabase';
import { SourceDatabase } from '@interfaces/sourceDatabase';
import { TagDatabase } from '@interfaces/tagDatabase';
import { TagPlugin } from '@interfaces/tagPlugin';

class FileCoordinatorWorker {
  private db: FileCoordinatorDatabase;
  private tagDb: TagDatabase;
  private sourceDb: SourceDatabase;
  private playlistDb: PlaylistDatabase;
  private filePlugin: FilePlugin;
  private tagPlugin: TagPlugin;
  private logger: Logger;
  constructor(
    db: FileCoordinatorDatabase,
    tagDb: TagDatabase,
    sourceDb: SourceDatabase,
    playlistDb: PlaylistDatabase,
    filePlugin: FilePlugin,
    tagPlugin: TagPlugin,
    logger: Logger,
  ) {
    this.db = db;
    this.tagDb = tagDb;
    this.sourceDb = sourceDb;
    this.playlistDb = playlistDb;
    this.filePlugin = filePlugin;
    this.tagPlugin = tagPlugin;
    this.logger = logger;
  }

  public processFile = async (fileId: string): Promise<void> => {
    const file = await this.db.getFileById(fileId);

    if (file.status !== Status.Downloaded && file.status !== Status.Completed) {
      return;
    }

    const tags = await this.db.getTagsByFileId(fileId);
    if (tags.length == 0) {
      return;
    }

    if (tags.length == 1) {
      const tag = tags[0];
      if (tag.status === Status.Completed) {
        this.logger.info(`Requesting tagging for file ${fileId}`);
        await this.requestTagging(fileId);
      }
      return;
    }

    if (
      !tags.every(
        (tag) => tag.status === Status.Completed || tag.status === Status.Error,
      )
    ) {
      return;
    }

    const tagMappings = await this.db.getTagMappings(fileId, false);

    for (const tagMapping of tagMappings) {
      const tagMappingPriority = await this.db.getTagMappingPriority(
        tagMapping.userId!,
      );

      const newTagMapping = this.rebuildTagMapping(
        tagMapping,
        tagMappingPriority,
        tags,
      );

      await this.db.updateTagMapping(newTagMapping);

      const userFileId = await this.db.getUserFileId(
        fileId,
        newTagMapping.userId!,
      );

      const fileSynchronization = UpdateFileSynchronizationDTO.fromJSON({
        timestamp: new Date().toISOString(),
        userFileId: userFileId,
        isSynchronized: false,
      });

      await this.db.updateFileSynchronization(fileSynchronization);
    }

    if (file.status === Status.Downloaded) {
      this.db.updateFileStatus(fileId, Status.Completed);
      file.status = Status.Completed;
    }
  };

  public rebuildTagMapping = (
    originalMapping: TagMappingDTO,
    tagMappingPriority: TagMappingPriorityDTO,
    tags: TagDTO[],
  ): TagMappingDTO => {
    const getMostRelevantTag = (
      tags: TagDTO[],
      sources: string[],
      // eslint-disable-next-line @typescript-eslint/ban-types
      tagSatisfies: Function,
    ): string => {
      for (const source of sources) {
        const tag = tags.find((tag) => tag.source === source);
        if (tag && tagSatisfies(tag)) {
          return tag.source;
        }
      }

      return tags.find((tag) => tag.isPrimary)!.source;
    };

    const mapping = new TagMappingDTO(
      originalMapping.id,
      originalMapping.userId,
      originalMapping.fileId,
      getMostRelevantTag(
        tags,
        tagMappingPriority.title,
        (tag: TagDTO) => tag.title !== null,
      ),
      getMostRelevantTag(
        tags,
        tagMappingPriority.artist,
        (tag: TagDTO) => tag.artist !== null,
      ),
      getMostRelevantTag(
        tags,
        tagMappingPriority.album,
        (tag: TagDTO) => tag.album !== null,
      ),
      getMostRelevantTag(
        tags,
        tagMappingPriority.picture,
        (tag: TagDTO) => tag.picturePath !== null,
      ),
      getMostRelevantTag(
        tags,
        tagMappingPriority.year,
        (tag: TagDTO) => tag.year !== null,
      ),
      getMostRelevantTag(
        tags,
        tagMappingPriority.trackNumber,
        (tag: TagDTO) => tag.trackNumber !== null,
      ),
      true,
    );

    return mapping;
  };

  public requestTagging = async (fileId: string): Promise<void> => {
    const primaryTag = await this.tagDb.getPrimaryTag(fileId);

    if (!primaryTag) {
      throw Error('Primary tag not found');
    }

    if (primaryTag.status !== 'C') {
      throw Error('Primary tag is not parsed');
    }

    const sources = await this.sourceDb.getSourcesWithParsingPermission();
    await Promise.all(
      sources.map(async (source) => {
        if (await this.tagDb.getTagByFile(fileId, source.id)) {
          throw Error('Parsing already requested');
        }
        await this.tagDb.insertTag(
          TagDTO.allFromOneSource('0', fileId, false, source.id, 'CR'),
        );
        await this.tagPlugin.parseTags(fileId, source.description);
      }),
    );
  };

  public downloadFile = async (
    playlistId: string,
    url: string,
  ): Promise<void> => {
    const sourceId = await this.filePlugin.getSource(url);
    const normalizedUrl = await this.filePlugin.normalizeUrl(url);

    let file = await this.db.getFileByUrl(normalizedUrl);

    if (!file) {
      file = await this.db.insertFile(
        new FileDTO(
          '0',
          randomUUIDV4(),
          sourceId,
          Status.Created,
          normalizedUrl,
        ),
      );
      await this.tagDb.insertTag(
        TagDTO.allFromOneSource('0', file.id, true, sourceId, Status.Created),
      );
      await this.requestFileProcessing(file);
    }
    const userPlaylists =
      await this.playlistDb.getUserPlaylistsByPlaylistId(playlistId);

    userPlaylists!.forEach(async (userPlaylist) => {
      const userPlaylistFile = await this.playlistDb.getUserPlaylistFile(
        file!.id,
        userPlaylist.userId,
        playlistId,
      );

      if (userPlaylistFile) {
        return;
      }

      await this.playlistDb.insertUserPlaylistFile({
        fileId: file!.id,
        playlistId: userPlaylist.playlistId,
        missingFromRemote: false,
      });
      const userFile = await this.db.getUserFile(userPlaylist.userId, file!.id);
      if (!userFile) {
        await this.db.insertUserFile(userPlaylist.userId, file!.id);
      }
      await this.tagDb.insertTagMapping(
        TagMappingDTO.allFromOneSource(userPlaylist.userId, file!.id, sourceId),
      );

      const devices = await this.db.getDeviceIdsByUser(userPlaylist.userId);

      devices.forEach(async (deviceId) => {
        await this.db.insertSynchronizationRecordsByDevice(
          userFile!.id,
          deviceId,
        );
      });
    });
  };

  public requestFileProcessing = async (file: FileDTO): Promise<void> => {
    const source = await this.sourceDb.getSource(file.source);
    await this.filePlugin.downloadFile(file, source!.description);
    await this.tagPlugin.tagFile(file, source!.description);
  };

  public processPlaylist = async (
    playlistId: string,
    files: string[],
  ): Promise<void> => {
    const playlist = await this.playlistDb.getPlaylistByPlaylistId(playlistId);
    if (!playlist) {
      this.logger.error(`Playlist not found: ${playlistId}`);
      throw new Error('Playlist not found');
    }
    const userPlaylists =
      await this.playlistDb.getUserPlaylistsByPlaylistId(playlistId);

    if (userPlaylists.length == 0) {
      this.logger.error(`User playlists not found: ${playlistId}`);
      throw new Error('User playlists not found');
    }

    userPlaylists.forEach(async (userPlaylist) => {
      const currentFiles =
        await this.playlistDb.getUserPlaylistFilesAndFileByPlaylistId(
          userPlaylist.id,
        );

      const newFiles = currentFiles.filter((upff) =>
        files.includes(upff.file.sourceUrl),
      );

      const removedFiles = currentFiles.filter(
        (upff) => !files.includes(upff.file.sourceUrl),
      );

      newFiles.forEach(async (currentFile) => {
        await this.downloadFile(playlistId, currentFile.file.sourceUrl);
      });

      removedFiles.forEach(async (upff) => {
        await this.playlistDb.updateUserPlaylistFile(upff.file.id, false);
        const fileSynchronization = UpdateFileSynchronizationDTO.fromJSON({
          timestamp: new Date().toISOString(),
          userFileId: upff.file.id,
          isSynchronized: false,
        });
        await this.db.updateFileSynchronization(fileSynchronization);
      });
    });
  };
}

export { FileCoordinatorWorker };
