import { TaggedFileDTO } from '@src/dtos/taggedFileDTO';
import { File } from '@src/entities/file';

import { DataMapper } from '.';
import { PlaylistMappingMapper } from './playlistMappingMapper';
import { ShortTagsMapper } from './shortTagsMapper';
import { SourceMapper } from './sourceMapper';

class TaggedFileMapper implements DataMapper<TaggedFileDTO, File> {
  public toEntity = (data: TaggedFileDTO): File => {
    return new File(
      data.id.toString(),
      new SourceMapper().toEntity(data.source),
      data.status,
      data.sourceUrl,
      data.isSynchronized,
      data.tags ? new ShortTagsMapper().toEntity(data.tags) : null,
      data.playlists
        ? data.playlists!.map((playlist) =>
            new PlaylistMappingMapper().toEntity(playlist)
          )
        : null
    );
  };
}

export { TaggedFileMapper };
