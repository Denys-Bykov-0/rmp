import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { v4 as randomUUIDV4 } from 'uuid';

import { Status } from '@src/dtos/statusDTO';
import { TagDTO } from '@src/dtos/tagDTO';
import { ShortTags } from '@src/entities/file';
import { Tag } from '@src/entities/tag';
import { iFileDatabase } from '@src/interfaces/iFileDatabase';
import { iSourceDatabase } from '@src/interfaces/iSourceDatabase';
import { iTagDatabase } from '@src/interfaces/iTagDatabase';
import { iTagPlugin } from '@src/interfaces/iTagPlugin';
import { TagMapper } from '@src/mappers/tagMapper';
import { dataLogger } from '@src/utils/server/logger';

import { ProcessingError, ProcessingErrorCode } from './processingError';

export class TagWorker {
  private db: iTagDatabase;
  private tagPlugin: iTagPlugin;
  private fileDb: iFileDatabase;
  private sourceDb: iSourceDatabase;

  constructor(
    db: iTagDatabase,
    fileDb: iFileDatabase,
    sourceDb: iSourceDatabase,
    tagPlugin: iTagPlugin
  ) {
    this.db = db;
    this.fileDb = fileDb;
    this.sourceDb = sourceDb;
    this.tagPlugin = tagPlugin;
    dataLogger.trace('TagWorker initialized');
  }

  public getFileTags = async (fileId: string): Promise<Array<Tag>> => {
    const doesFileExist = await this.fileDb.doesFileExist(fileId);
    if (!doesFileExist) {
      throw new ProcessingError({
        message: 'File not found',
      });
    }
    const tags = await this.db.getFileTags(fileId);
    return tags.map((tag) => {
      return new TagMapper().toEntity(tag);
    });
  };

  public getPictureOfTag = async (tagId: string): Promise<string> => {
    const tag = await this.db.getTag(tagId);

    if (!tag) {
      throw new ProcessingError({
        message: 'Tag not found',
      });
    }

    if (!tag.picturePath) {
      throw new ProcessingError({
        message: 'Tag has no picture',
      });
    }

    return tag.picturePath;
  };

  public parseTags = async (fileId: string): Promise<Array<Tag>> => {
    await this.requestTagging(fileId);
    return this.getFileTags(fileId);
  };

  public requestTagging = async (fileId: string): Promise<void> => {
    const primaryTag = await this.db.getPrimaryTag(fileId);

    if (!primaryTag) {
      throw new ProcessingError({
        message: 'Primary tag not found',
      });
    }

    if (primaryTag.status !== 'C') {
      throw new ProcessingError({
        message: 'Primary tag is not completed',
      });
    }

    const sources = await this.sourceDb.getSourcesWithParsingPermission();
    await Promise.all(
      sources.map(async (source) => {
        if (await this.db.getTagByFile(fileId, source.id)) {
          throw new ProcessingError({
            message: 'Parsing already requested',
          });
        }
        await this.db.insertTag(
          TagDTO.allFromOneSource('0', fileId, false, source.id, 'CR')
        );
        await this.tagPlugin.parseTags(fileId, source.description);
      })
    );
  };

  public addCustomTags = async (
    fileId: string,
    userId: string,
    customTags: ShortTags
  ): Promise<Tag> => {
    const userFileRecord = await this.fileDb.getUserFileRecord(fileId, userId);
    if (!userFileRecord) {
      throw new ProcessingError({
        message: 'File not found',
        errorCode: ProcessingErrorCode.FILE_NOT_FOUND,
      });
    }
    const customId = await this.sourceDb.getCustomSourceId();
    const existingTag = await this.db.getTagByFile(fileId, customId);

    const result = existingTag
      ? await this.db.updateTag(
          new TagDTO(
            existingTag.id,
            existingTag.fileId,
            existingTag.isPrimary,
            existingTag.source,
            existingTag.status,
            customTags.title,
            customTags.artist,
            customTags.album,
            customTags.year,
            customTags.trackNumber,
            existingTag.picturePath
          )
        )
      : await this.db.insertTag(
          new TagDTO(
            '0',
            fileId,
            false,
            customId,
            Status.Completed,
            customTags.title,
            customTags.artist,
            customTags.album,
            customTags.year,
            customTags.trackNumber,
            null
          )
        );

    return new TagMapper().toEntity(result);
  };

  public addCustomTagPicture = async (
    bufferFile: Buffer,
    fileId: string,
    userId: string,
    picturePath: string
  ): Promise<void> => {
    try {
      const { format } = await sharp(bufferFile).metadata();
      const fileName = `${randomUUIDV4()}.${format}`;
      const filePath = path.join(picturePath, fileName);
      await fs.writeFile(filePath, bufferFile);
    } catch (error) {
      throw new ProcessingError({
        message: 'Failed to save picture',
      });
    }
    const userFileRecord = await this.fileDb.getUserFileRecord(fileId, userId);
    if (!userFileRecord) {
      throw new ProcessingError({
        message: 'File not found',
        errorCode: ProcessingErrorCode.FILE_NOT_FOUND,
      });
    }
    const customId = await this.sourceDb.getCustomSourceId();
    const existingTag = await this.db.getTagByFile(fileId, customId);

    if (!existingTag) {
      throw new ProcessingError({
        message: 'Tag not found',
      });
    }

    await this.db.updateTag(
      new TagDTO(
        existingTag.id,
        existingTag.fileId,
        existingTag.isPrimary,
        existingTag.source,
        existingTag.status,
        existingTag.title,
        existingTag.artist,
        existingTag.album,
        existingTag.year,
        existingTag.trackNumber,
        picturePath
      )
    );
  };
}
