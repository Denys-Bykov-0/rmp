import { TagMapping } from '@src/entities/tagMapping';
import { TagMappingPriority } from '@src/entities/tagMappingPriority';
import { iFileDatabase } from '@src/interfaces/iFileDatabase';
import { iTagMappingDatabase } from '@src/interfaces/iTagMappingDatabase';
import { TagMappingMapper } from '@src/mappers/tagMappingMapper';
import { TagMappingPriorityMapper } from '@src/mappers/tagMappingPriorityMapper';

import { ProcessingError } from './processingError';

class TagMappingWorker {
  private db: iTagMappingDatabase;
  private fileDb: iFileDatabase;

  constructor(db: iTagMappingDatabase, fileDb: iFileDatabase) {
    this.db = db;
    this.fileDb = fileDb;
  }

  public getTagMappingPriority = async (
    userId: string
  ): Promise<TagMappingPriority> => {
    try {
      const tagMappingPriorityDTO = await this.db.getTagMappingPriority(userId);
      if (!tagMappingPriorityDTO) {
        throw new ProcessingError('Tag mapping priority does not exist');
      }
      return new TagMappingPriorityMapper().toEntity(tagMappingPriorityDTO);
    } catch (error) {
      throw new ProcessingError('Failed to get tag mapping priority');
    }
  };

  public updateTagMapping = async (
    tagMapping: TagMapping,
    fileId: string
  ): Promise<TagMapping> => {
    try {
      const tagMappingDTO = new TagMappingMapper().toDTO(tagMapping);
      const updatedTagMappingDTO = await this.db.updateTagMapping(
        tagMappingDTO,
        fileId
      );
      const userFilesIds = await this.fileDb.getUserFiles(
        updatedTagMappingDTO.userId!,
        fileId
      );

      for (const userFileId of userFilesIds) {
        await this.fileDb.updateSynchronizationRecords(
          new Date().toISOString(),
          userFileId,
          false,
          true
        );
      }

      return new TagMappingMapper().toEntity(updatedTagMappingDTO);
    } catch (error) {
      throw new ProcessingError('Failed to update tag mapping');
    }
  };

  public updateTagMappingPriority = async (
    tagMappingPriority: TagMappingPriority,
    userId: string
  ): Promise<TagMappingPriority> => {
    try {
      const tagMappingPriorityDTO = new TagMappingPriorityMapper().toDTO(
        tagMappingPriority
      );
      tagMappingPriorityDTO.userId = userId;
      return new TagMappingPriorityMapper().toEntity(
        await this.db.updateTagMappingPriority(tagMappingPriorityDTO)
      );
    } catch (error) {
      throw new ProcessingError('Failed to update tag mapping priority');
    }
  };
}

export { TagMappingWorker };
