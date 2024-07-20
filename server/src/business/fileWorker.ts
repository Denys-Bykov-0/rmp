import { randomUUID } from 'crypto';

import {
  ProcessingError,
  ProcessingErrorCode,
} from '@src/business/processingError';
import { FileDTO } from '@src/dtos/fileDTO';
import { Status } from '@src/dtos/statusDTO';
import { TagDTO } from '@src/dtos/tagDTO';
import { TagMappingDTO } from '@src/dtos/tagMappingDTO';
import { UpdateFileSynchronizationDTO } from '@src/dtos/updateFileSynchronizationDTO';
import { File } from '@src/entities/file';
import { FileData } from '@src/entities/fileData';
import { GetFileResponse } from '@src/entities/getFileResponse';
import { User } from '@src/entities/user';
import { iFileDatabase } from '@src/interfaces/iFileDatabase';
import { iFilePlugin } from '@src/interfaces/iFilePlugin';
import { FileType, iFileSystem } from '@src/interfaces/iFileSystem';
import { iFileTagger } from '@src/interfaces/iFileTagger';
import { iPlaylistDatabase } from '@src/interfaces/iPlaylistDatabase';
import { iSourceDatabase } from '@src/interfaces/iSourceDatabase';
import { iTagDatabase } from '@src/interfaces/iTagDatabase';
import { iTagPlugin } from '@src/interfaces/iTagPlugin';
import { TagMappingMapper } from '@src/mappers/tagMappingMapper';
import { TaggedFileMapper } from '@src/mappers/taggedFileMapper';
import { dataLogger } from '@src/utils/server/logger';

export class FileWorker {
  private db: iFileDatabase;
  private sourceDb: iSourceDatabase;
  private tagDb: iTagDatabase;
  private playlistDb: iPlaylistDatabase;
  private fileSystem: iFileSystem;
  private filePlugin: iFilePlugin;
  private tagPlugin: iTagPlugin;
  private fileTagger: iFileTagger;

  constructor(
    db: iFileDatabase,
    sourceDb: iSourceDatabase,
    tagDb: iTagDatabase,
    playlistDb: iPlaylistDatabase,
    fileSystem: iFileSystem,
    filePlugin: iFilePlugin,
    tagPlugin: iTagPlugin,
    fileTagger: iFileTagger
  ) {
    this.db = db;
    this.sourceDb = sourceDb;
    this.tagDb = tagDb;
    this.playlistDb = playlistDb;
    this.fileSystem = fileSystem;
    this.filePlugin = filePlugin;
    this.tagPlugin = tagPlugin;
    this.fileTagger = fileTagger;
  }

  public addFile = async (sourceUrl: string, user: User): Promise<File> => {
    const sourceId = this.filePlugin.getSource(sourceUrl);
    const normalizedUrl = this.filePlugin.normalizeUrl(sourceUrl);

    let file = await this.db.getFileByUrl(normalizedUrl);

    if (!file) {
      file = await this.db.insertFile(
        new FileDTO('0', randomUUID(), sourceId, Status.Created, normalizedUrl)
      );
      await this.tagDb.insertTag(
        TagDTO.allFromOneSource('0', file.id, true, sourceId, Status.Created)
      );
      await this.requestFileProcessing(file);
    }

    const userPlaylistId = await this.playlistDb.getDefaultUserPlaylistId(
      user.id
    );

    const playlistFile = await this.playlistDb.getUserPlaylistFile(
      file!.id,
      user.id
    );

    if (playlistFile) {
      throw new ProcessingError({
        message: 'File already exists',
      });
    }

    await this.playlistDb.insertUserPaylistFile(userPlaylistId, file.id);

    const userFile = await this.db.getUserFile(user.id, file!.id);

    let userFileId;
    if (!userFile) {
      userFileId = await this.db.insertUserFile(user.id, file!.id);
    } else {
      userFileId = userFile.id;
    }

    await this.tagDb.insertTagMapping(
      TagMappingDTO.allFromOneSource(user.id, file.id, sourceId)
    );
    await this.db.insertSynchronizationRecordsByUser(user.id, userFileId);
    const taggedFile = await this.db.getTaggedFileByUrl(file.sourceUrl, user);
    return new TaggedFileMapper().toEntity(taggedFile!);
  };

  public requestFileProcessing = async (file: FileDTO): Promise<void> => {
    const source = await this.sourceDb.getSource(file.source);
    this.filePlugin.downloadFile(file, source!.description);
    await this.tagPlugin.tagFile(file, source!.description);
  };

  public getTaggedFilesByUser = async (
    user: User,
    deviceId: string,
    statuses: Array<string> | null,
    synchronized: boolean | null,
    playlists: Array<string> | null
  ): Promise<Array<File>> => {
    const userFiles = await this.db.getTaggedFilesByUser(
      user,
      deviceId,
      statuses,
      synchronized,
      playlists
    );

    const files: Array<File> = userFiles.map((file) => {
      return new TaggedFileMapper().toEntity(file);
    });

    return files;
  };

  public getTaggedFile = async (
    id: string,
    deviceId: string,
    user: User,
    expand: string[]
  ): Promise<GetFileResponse> => {
    let mapping = null;

    const taggedFile = await this.db.getTaggedFile(id, deviceId, user.id);
    if (!taggedFile) {
      throw new ProcessingError({
        message: 'File not found',
        errorCode: ProcessingErrorCode.FILE_NOT_FOUND,
      });
    }

    for (const variation of expand) {
      if (variation === 'mapping') {
        const mappingDTO = await this.tagDb.getTagMapping(
          user.id,
          taggedFile.id
        );
        if (!mappingDTO) {
          throw new ProcessingError({
            message: 'Tag mapping does not exist',
            errorCode: ProcessingErrorCode.MAPPING_NOT_FOUND,
          });
        }
        mapping = new TagMappingMapper().toEntity(mappingDTO);
      } else {
        throw new ProcessingError({
          message: `${variation} is not a valid epxand option`,
        });
      }
    }

    return new GetFileResponse(
      new TaggedFileMapper().toEntity(taggedFile),
      mapping
    );
  };

  public confirmFile = async (
    fileId: string,
    user: User,
    deviceId: string
  ): Promise<void> => {
    const userFile = await this.db.getUserFile(user.id, fileId);
    const fileSyncByDevice = await this.db.getSyncrhonizationRecordsByDevice(
      deviceId,
      userFile!.id
    );
    const userPlaylistFiles = await this.playlistDb.getUserPlaylistFile(
      fileId,
      user.id
    );

    if (userPlaylistFiles) {
      const fileSynchronization = UpdateFileSynchronizationDTO.fromJSON({
        timestamp: new Date().toISOString(),
        userFileId: userFile!.id,
        isSynchronized: true,
        wasChanged: false,
      });
      await this.db.updateSynchronizationRecords(fileSynchronization);
      return;
    }

    await this.db.deleteSyncrhonizationRecordsByDevice(
      fileSyncByDevice.deviceId,
      fileSyncByDevice.userFileId
    );

    const fileSyncByUser = await this.db.getSyncrhonizationRecordsByUserFile(
      userFile!.id
    );

    if (fileSyncByUser) {
      return;
    }

    await this.db.deleteUserFile(userFile!.id);
    const userFiles = await this.db.getUserFilesByFileId(fileId);

    if (userFiles.length) {
      return;
    }

    const file = await this.db.getFile(fileId);
    const tags = await this.tagDb.getFileTags(fileId);
    tags.forEach(async (tag) => {
      await this.tagDb.deleteTag(tag.id);
      if (tag.picturePath) {
        try {
          await this.fileSystem.removeFile(tag.picturePath, FileType.IMG);
        } catch (err) {
          dataLogger.debug(err);
        }
      }
    });
    await this.tagDb.deleteTagMapping(fileId);
    await this.db.deleteFileById(fileId);
    try {
      await this.fileSystem.removeFile(file!.path, FileType.MUSIC);
    } catch (err) {
      dataLogger.debug(err);
    }
  };

  public downloadFile = async (
    fileId: string,
    userId: string
  ): Promise<FileData> => {
    const file = await this.db.getFile(fileId);

    if (file == null) {
      throw new ProcessingError({
        message: 'File not found or not processed',
      });
    }

    if (file.status !== Status.Completed) {
      if (file.status === Status.Error) {
        throw new ProcessingError({
          message: 'File preparation failed',
          errorCode: ProcessingErrorCode.FILE_PREPARATION_FAILED,
        });
      } else {
        throw new ProcessingError({
          message: 'File is not ready yet',
          errorCode: ProcessingErrorCode.FILE_NOT_READY,
        });
      }
    }

    const tag = await this.tagDb.getMappedTag(fileId, userId);

    const data = await this.fileTagger.tagFile(file!.path, tag);

    return new FileData(`${file!.path}.mp3`, data);
  };

  public deleteFile = async (
    fileId: string,
    userId: string,
    playlistIds: Array<string>
  ): Promise<void> => {
    const userFile = await this.db.getUserFile(userId, fileId);
    if (!userFile) {
      throw new ProcessingError({
        message: 'File does not exist',
      });
    }
    await this.playlistDb.deleteUserPlaylistsFile(fileId, userId, playlistIds);
    const fileSynchronization = UpdateFileSynchronizationDTO.fromJSON({
      timestamp: new Date().toISOString(),
      userFileId: userFile.id,
      isSynchronized: false,
      wasChanged: true,
    });
    await this.db.updateSynchronizationRecords(fileSynchronization);
    return;
  };
}
