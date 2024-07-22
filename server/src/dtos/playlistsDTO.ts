import { SourceDTO } from './sourceDTO';

class PlaylistDTO {
  constructor(
    public readonly id: string,
    public readonly source: SourceDTO,
    public readonly sourceUrl: string | null,
    public readonly addedTs: Date | null,
    public readonly status: string,
    public readonly synchronizationTs: Date | null,
    public readonly title: string
  ) {}

  public static fromJSON(json: JSON.JSONObject): PlaylistDTO {
    const opts = {
      id: json.playlist_id,
      source: SourceDTO.fromJSON(json),
      sourceUrl: json.playlist_source_url,
      addedTs: json.playlist_added_ts ? new Date(json.playlist_added_ts) : null,
      status: json.playlist_status,
      synchronizationTs: json.playlist_synchronization_ts
        ? new Date(json.playlist_synchronization_ts)
        : null,
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
