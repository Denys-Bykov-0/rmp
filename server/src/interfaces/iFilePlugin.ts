import { FileDTO } from '@src/dtos/fileDTO';

export abstract class iFilePlugin {
  pluginName!: string;
  public abstract getSource: (url: string) => string;
  public abstract normalizeUrl: (url: string) => string;
  public abstract normalizePlaylistUrl: (url: string) => string;
  public abstract requestFileProcessing: (
    url: string,
    userId: string,
    playlistId: string
  ) => void;
  public abstract downloadFile: (
    file: FileDTO,
    routingKey: string
  ) => Promise<void>;
}
