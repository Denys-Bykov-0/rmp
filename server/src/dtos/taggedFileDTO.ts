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
  public playlists: string[] | null;
  public missingRemote: boolean | null;

  constructor(
    id: string,
    source: SourceDTO,
    status: string,
    sourceUrl: string,
    isSynchronized: boolean,
    tags: ShortTagsDTO | null,
    playlists: string[] | null,
    missingRemote: boolean | null
  ) {
    this.id = id;
    this.source = source;
    this.status = status;
    this.sourceUrl = sourceUrl;
    this.isSynchronized = isSynchronized;
    this.tags = tags;
    this.playlists = playlists;
    this.missingRemote = missingRemote;
  }

  public static fromJSON = (json: JSON.JSONObject): TaggedFileDTO => {
    return new TaggedFileDTO(
      json.file_id.toString(),
      SourceDTO.fromJSON(json),
      json.file_status,
      json.file_source_url,
      json.is_synchronized,
      ShortTagsDTO.fromJSON(json),
      json.playlists,
      json.missing_from_remote
    );
  };
}

export { TaggedFileDTO, ShortTagsDTO };
