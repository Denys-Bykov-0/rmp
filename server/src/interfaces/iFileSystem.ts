export enum FileType {
  IMG = 'img',
  MUSIC = 'music',
}

export abstract class iFileSystem {
  public abstract removeFile: (
    path: string,
    fileType: FileType
  ) => Promise<void>;
}
