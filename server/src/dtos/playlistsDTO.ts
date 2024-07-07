import { SourceDTO } from './sourceDTO';

class PlaylistDTO {
  constructor(
    public readonly id: string,
    public readonly source: SourceDTO,
    public readonly sourceUrl: string,
    public readonly addedTs: Date,
    public readonly status: string,
    public readonly synchronizationTs: boolean,
    public readonly title: string
  ) {}

  public static fromJSON(json: JSON.JSONObject): PlaylistDTO {
    return new PlaylistDTO(
      json.playlist_id,
      SourceDTO.fromJSON(json),
      json.playlist_source_url,
      json.playlist_added_ts,
      json.playlist_status,
      json.playlist_synchronization_ts,
      json.playlist_title
    );
  }
}

export { PlaylistDTO };
