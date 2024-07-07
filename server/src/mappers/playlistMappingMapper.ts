import { PlaylistDTO } from '@src/dtos/playlistsDTO';
import { PlaylistMapping } from '@src/entities/playlistMapping';

import { DataMapper } from '.';

class PlaylistMappingMapper
  implements DataMapper<PlaylistDTO, PlaylistMapping>
{
  public toEntity = (data: PlaylistDTO): PlaylistMapping => {
    return new PlaylistMapping(data.sourceUrl, data.status, data.title);
  };
}

export { PlaylistMappingMapper };
