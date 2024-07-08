import { FileDTO } from '@dtos/fileDTO';

export abstract class TagPlugin {
  pluginName!: string;
  public abstract tagFile: (file: FileDTO, source: string) => Promise<void>;
  public abstract parseTags: (fileId: string, source: string) => Promise<void>;
}
