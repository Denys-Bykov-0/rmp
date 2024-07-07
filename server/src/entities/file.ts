import { Playlist } from './playlists';
import { Source } from './source';

class ShortTags {
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
}

class File {
  public id: string;
  public source: Source;
  public status: string;
  public sourceUrl: string;
  public isSynchronized: boolean;
  public tags: ShortTags | null;
  public playlists: Playlist[] | null;

  constructor(
    id: string,
    source: Source,
    status: string,
    sourceUrl: string,
    isSynchronized: boolean,
    tags: ShortTags | null,
    playlists: Playlist[] | null
  ) {
    this.id = id;
    this.source = source;
    this.status = status;
    this.sourceUrl = sourceUrl;
    this.isSynchronized = isSynchronized;
    this.tags = tags;
    this.playlists = playlists;
  }
}

export { File, ShortTags };
