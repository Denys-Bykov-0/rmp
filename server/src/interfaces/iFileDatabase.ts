import { FileDTO } from '@src/dtos/fileDTO';
import { FileSynchronizationDTO } from '@src/dtos/fileSynchronizationDTO';
import { TaggedFileDTO } from '@src/dtos/taggedFileDTO';
import { UserDTO } from '@src/dtos/userDTO';
import { UserFileDTO } from '@src/dtos/userFileDTO';

export abstract class iFileDatabase {
  public abstract getFileByUrl: (url: string) => Promise<FileDTO | null>;
  public abstract getTaggedFileByUrl: (
    url: string,
    user: UserDTO
  ) => Promise<TaggedFileDTO | null>;
  public abstract getTaggedFilesByUser: (
    user: UserDTO,
    deviceId: string,
    statuses: Array<string> | null,
    synchronized: boolean | null,
    playlists: Array<string> | null
  ) => Promise<Array<TaggedFileDTO>>;
  public abstract insertFile: (file: FileDTO) => Promise<FileDTO>;
  public abstract insertUserFile: (
    userId: string,
    fileId: string
  ) => Promise<string>;
  public abstract getTaggedFile: (
    id: string,
    deviceId: string,
    userId: string
  ) => Promise<TaggedFileDTO | null>;
  public abstract doesFileExist(fileId: string): Promise<boolean>;
  public abstract getUserFile: (
    userId: string,
    fileId: string
  ) => Promise<UserFileDTO | null>;
  public abstract insertSynchronizationRecordsByUser: (
    userId: string,
    userFileId: string
  ) => Promise<void>;
  public abstract inserSyncrhonizationRecordsByDevice: (
    deviceId: string,
    userFileId: string
  ) => Promise<void>;
  public abstract updateSynchronizationRecords: ({
    timestamp,
    userFileId,
    isSynchronized,
    wasChanged,
    deviceId,
  }: {
    timestamp: string;
    userFileId: string;
    isSynchronized: boolean;
    wasChanged: boolean;
    deviceId?: string;
  }) => Promise<void>;
  public abstract getUserFiles: (
    userId: string,
    fileId: string
  ) => Promise<Array<string>>;
  public abstract getUserFileIds: (userId: string) => Promise<Array<string>>;
  public abstract getFile(id: string): Promise<FileDTO | null>;
  public abstract getUserFileRecord(
    fileId: string,
    userId: string
  ): Promise<UserFileDTO | null>;
  public abstract getSyncrhonizationRecordsByDevice(
    deviceId: string,
    userFileId: string
  ): Promise<FileSynchronizationDTO>;
  public abstract deleteSyncrhonizationRecordsByDevice(
    deviceId: string,
    userFileId: string
  ): Promise<void>;
  public abstract getSyncrhonizationRecordsByUserFile(
    userFileId: string
  ): Promise<FileSynchronizationDTO | null>;
  public abstract deleteUserFile: (userFileId: string) => Promise<void>;
  public abstract getUserFilesByFileId: (
    fileId: string
  ) => Promise<Array<UserFileDTO>>;
  public abstract deleteFileById: (fileId: string) => Promise<void>;
}
