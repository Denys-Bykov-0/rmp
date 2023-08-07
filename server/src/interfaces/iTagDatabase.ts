import { Tag } from '@src/entities/tag';

export abstract class iTagDatabase {
  public abstract getFileTags(fileId: number): Promise<Tag | null>;
  public abstract getFilePictureTag(tagId: number): Promise<string | null>;
  public abstract getTagSources(): Promise<string[] | null>;
  public abstract getTagSourcePicture(sourceId: number): Promise<string | null>;
}
