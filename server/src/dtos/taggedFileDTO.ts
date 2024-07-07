import { PlaylistDTO } from './playlistsDTO';
import { SourceDTO } from './sourceDTO';

class ShortTagsDTO {
  public title: string;
  public artist: string;
  public album: string;
  public year: number;
  public trackNumber: number;

  constructor(
    title: string,
    artist: string,
    album: string,
    year: number,
    trackNumber: number
  ) {
    this.title = title;
    this.artist = artist;
    this.album = album;
    this.year = year;
    this.trackNumber = trackNumber;
  }

  public empty = (): boolean => {
    return (
      this.title === null &&
      this.artist === null &&
      this.album === null &&
      this.year === null &&
      this.trackNumber === null
    );
  };

  public static fromJSON = (json: JSON.JSONObject): ShortTagsDTO => {
    return new ShortTagsDTO(
      json.tag_title,
      json.tag_artist,
      json.tag_album,
      json.tag_year,
      json.tag_track_number
    );
  };
}

class TaggedFileDTO {
  public id: string;
  public source: SourceDTO;
  public status: string;
  public sourceUrl: string;
  public isSynchronized: boolean;
  public tags: ShortTagsDTO | null;
  public playlists: PlaylistDTO[] | null;

  constructor(
    id: string,
    source: SourceDTO,
    status: string,
    sourceUrl: string,
    isSynchronized: boolean,
    tags: ShortTagsDTO | null,
    playlists: PlaylistDTO[] | null
  ) {
    this.id = id;
    this.source = source;
    this.status = status;
    this.sourceUrl = sourceUrl;
    this.isSynchronized = isSynchronized;
    this.tags = tags;
    this.playlists = playlists;
  }

  public static fromJSONS = (jsons: JSON.JSONObject[]): TaggedFileDTO[] => {
    const uniqueFiles = new Map<string, TaggedFileDTO>();

    jsons.forEach((json) => {
      const file = uniqueFiles.get(json.file_id);
      const playlistDTO = PlaylistDTO.fromJSON(json);
      const shortTagsDTO = ShortTagsDTO.fromJSON(json);

      if (file) {
        file.playlists = file.playlists
          ? [...file.playlists, playlistDTO]
          : [playlistDTO];
      } else {
        uniqueFiles.set(
          json.file_id.toString(),
          new TaggedFileDTO(
            json.file_id.toString(),
            SourceDTO.fromJSON(json),
            json.file_status,
            json.file_source_url,
            json.is_synchronized,
            shortTagsDTO.empty() ? null : shortTagsDTO,
            [playlistDTO]
          )
        );
      }
    });

    return Array.from(uniqueFiles.values());
  };
}

export { TaggedFileDTO, ShortTagsDTO };
