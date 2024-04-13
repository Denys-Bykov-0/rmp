import { TagDTO } from '@src/dtos/tagDTO';
import { TagMappingDTO } from '@src/dtos/tagMappingDTO';

export abstract class iTagDatabase {
  public abstract getFileTags(fileId: string): Promise<Array<TagDTO>>;
  public abstract getTag(id: string): Promise<TagDTO | null>;
  public abstract getTagByFile(
    fileId: string,
    sourceId: string
  ): Promise<TagDTO | null>;
  public abstract getPrimaryTag(fileId: string): Promise<TagDTO | null>;
  public abstract insertTagMapping(
    tagMapping: TagMappingDTO
  ): Promise<TagMappingDTO>;
  public abstract insertTag(tag: TagDTO): Promise<TagDTO>;
  public abstract getTagMapping(
    userId: string,
    fileId: string
  ): Promise<TagMappingDTO | null>;
}
