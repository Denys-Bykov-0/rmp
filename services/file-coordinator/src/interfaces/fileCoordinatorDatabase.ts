import { FileDTO } from '@dtos/fileDTO';
import { TagDTO } from '@dtos/tagDTO';
import { TagMappingDTO } from '@dtos/tagMappingDTO';
import { TagMappingPriorityDTO } from '@dtos/tagMappingPriorityDTO';
import { UpdateFileSynchronizationDTO } from '@dtos/updateFileSynchronizationDTO';
import { UserFileDTO } from '@dtos/userFileDTO';

abstract class FileCoordinatorDatabase {
  public abstract getFileById: (id: string) => Promise<FileDTO>;
  public abstract updateFileSynchronization: (
    fileSynchronization: UpdateFileSynchronizationDTO,
  ) => Promise<void>;
  public abstract getTagsByFileId: (id: string) => Promise<TagDTO[]>;
  public abstract getTagMappings: (
    fileId: string,
    fixed: boolean,
  ) => Promise<TagMappingDTO[]>;
  public abstract getTagMappingPriority: (
    userId: string,
  ) => Promise<TagMappingPriorityDTO>;
  public abstract updateTagMapping: (
    tagMapping: TagMappingDTO,
  ) => Promise<void>;
  public abstract getUserFileId: (
    fileId: string,
    userId: string,
  ) => Promise<string>;
  public abstract updateFileStatus: (
    fileId: string,
    status: string,
  ) => Promise<void>;
  public abstract getFileByUrl: (url: string) => Promise<FileDTO | null>;
  public abstract insertFile: (file: FileDTO) => Promise<FileDTO>;
  public abstract getUserFile: (
    userId: string,
    fileId: string,
  ) => Promise<UserFileDTO>;
  public abstract insertUserFile: (
    userId: string,
    fileId: string,
  ) => Promise<UserFileDTO>;
  public abstract getDeviceIdsByUser: (userId: string) => Promise<string[]>;
  public abstract insertSynchronizationRecordsByDevice: (
    userFileId: string,
    deviceId: string,
  ) => Promise<void>;
}

export { FileCoordinatorDatabase };
