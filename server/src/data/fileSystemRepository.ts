import { promises as fs } from 'fs';
import { join } from 'path';

import { Config } from '@src/entities/config';
import { FileType, iFileSystem } from '@src/interfaces/iFileSystem';

export class FileSystemRepository implements iFileSystem {
  constructor(public readonly config: Config) {}
  public removeFile = async (
    path: string,
    fileType: FileType
  ): Promise<void> => {
    try {
      switch (fileType) {
        case FileType.IMG:
          await fs.unlink(join(this.config.appPathStorage, 'img', path));
          break;
        case FileType.MUSIC:
          await fs.unlink(
            join(this.config.appPathStorage, 'music', path + '.mp3')
          );
          break;
        default:
          throw new Error('Unknown file type');
      }
    } catch (err) {
      throw new Error(`File deletion error: ${err}`);
    }
  };
}
