class TagMappingDTO {
  public id: string | null;
  public userId: string | null;
  public fileId: string | null;
  public title: string;
  public artist: string;
  public album: string;
  public picture: string;
  public year: string;
  public trackNumber: string;
  public fixed: boolean;

  constructor(
    id: string | null,
    userId: string | null,
    fileId: string | null,
    title: string,
    artist: string,
    album: string,
    picture: string,
    year: string,
    trackNumber: string,
    fixed: boolean = false
  ) {
    this.id = id;
    this.userId = userId;
    this.fileId = fileId;
    this.title = title;
    this.artist = artist;
    this.album = album;
    this.picture = picture;
    this.year = year;
    this.trackNumber = trackNumber;
    this.fixed = fixed;
  }

  public static allFromOneSource = (
    user_id: string,
    file_id: string,
    source: string
  ): TagMappingDTO => {
    return new TagMappingDTO(
      '0',
      user_id,
      file_id,
      source,
      source,
      source,
      source,
      source,
      source
    );
  };

  public static fromJSON(json: JSON.JSONObject): TagMappingDTO {
    return new TagMappingDTO(
      json.tag_mapping_id.toString(),
      json.tag_mapping_user_id.toString(),
      json.tag_mapping_file_id.toString(),
      json.tag_mapping_title.toString(),
      json.tag_mapping_artist.toString(),
      json.tag_mapping_album.toString(),
      json.tag_mapping_picture.toString(),
      json.tag_mapping_year.toString(),
      json.tag_mapping_track_number.toString()
    );
  }
}

export { TagMappingDTO };
