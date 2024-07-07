import { PlaylistDTO } from '@src/dtos/playlistsDTO';
import { Playlist } from '@src/entities/playlists';

import { DataMapper } from '.';
import { SourceMapper } from './sourceMapper';

class PlaylistMapper implements DataMapper<PlaylistDTO, Playlist> {
  public toEntity = (data: PlaylistDTO): Playlist => {
    return new Playlist(
      data.id,
      new SourceMapper().toEntity(data.source),
      data.sourceUrl ? data.sourceUrl : null,
      data.addedTs,
      data.status,
      data.synchronizationTs,
      data.title
    );
  };
}

export { PlaylistMapper };
