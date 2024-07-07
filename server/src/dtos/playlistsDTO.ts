import { SourceDTO } from './sourceDTO';

class PlaylistDTO {
  constructor(
    public readonly id: string,
    public readonly source: SourceDTO,
    public readonly sourceUrl: string | null,
    public readonly addedTs: Date,
    public readonly status: string,
    public readonly synchronizationTs: Date,
    public readonly title: string
  ) {}

  public static fromJSON(json: JSON.JSONObject): PlaylistDTO {
    const opts = {
      id: json.playlist_id,
      source: SourceDTO.fromJSON(json),
      sourceUrl: json.playlist_source_url,
      addedTs: new Date(json.playlist_added_ts),
      status: json.playlist_status,
      synchronizationTs: new Date(json.playlist_synchronization_ts),
      title: json.playlist_title,
    };

    return new PlaylistDTO(
      opts.id,
      opts.source,
      opts.sourceUrl,
      opts.addedTs,
      opts.status,
      opts.synchronizationTs,
      opts.title
    );
  }
}

export { PlaylistDTO };
