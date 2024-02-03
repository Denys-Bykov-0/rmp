import { TagSource } from './source';
import { Status } from './status';

export class Tag {
  public id: number;
  public fileId: number;
  public title: string;
  public artist: string;
  public album: string;
  public picturePath: string;
  public year: Date;
  public trackNumber: number;
  public sourceType: TagSource;
  public status: Status;
  constructor(
    id: number,
    fileId: number,
    title: string,
    artist: string,
    album: string,
    picturePath: string,
    year: Date,
    trackNumber: number,
    sourceType: TagSource,
    status: Status
  ) {
    this.id = id;
    this.fileId = fileId;
    this.title = title;
    this.artist = artist;
    this.album = album;
    this.picturePath = picturePath;
    this.year = year;
    this.trackNumber = trackNumber;
    this.sourceType = sourceType;
    this.status = status;
  }
  public static fromJSON(json: JSON.JSONObject): Tag {
    return new Tag(
      json.tag_id,
      json.tag_file_id,
      json.tag_title,
      json.tag_artist,
      json.tag_album,
      json.tag_picture_path,
      json.tag_year,
      json.tag_track_number,
      TagSource.fromJSON(json),
      json.tag_status
    );
  }

  public toJSON(): JSON.JSONObject {
    return {
      id: this.id,
      fileId: this.fileId,
      title: this.title,
      artist: this.artist,
      album: this.album,
      picturePath: this.picturePath,
      year: this.year,
      trackNumber: this.trackNumber,
      sourceType: this.sourceType,
      status: this.status,
    };
  }
}
