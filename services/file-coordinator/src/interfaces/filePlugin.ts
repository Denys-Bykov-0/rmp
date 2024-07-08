import { FileDTO } from '@dtos/fileDTO';

export abstract class FilePlugin {
  pluginName!: string;
  public abstract getSource: (url: string) => Promise<string>;
  public abstract normalizeUrl: (url: string) => Promise<string>;
  public abstract normalizeUrlPlaylist: (url: string) => string;
  public abstract downloadFile: (
    file: FileDTO,
    source: string,
  ) => Promise<void>;
}
