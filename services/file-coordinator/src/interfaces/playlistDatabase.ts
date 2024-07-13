import { PlaylistDTO } from '@dtos/playlistsDTO';
import { TaggedUserPlaylistFileDTO } from '@dtos/taggedUserPlaylistFileDTO';
import { UserPlaylistDTO } from '@dtos/userPlaylistDTO';
import { UserPlaylistFileDTO } from '@dtos/userPlaylistFileDTO';

export abstract class PlaylistDatabase {
  public abstract getUserPlaylistsByPlaylistId: (
    playlistId: string,
  ) => Promise<UserPlaylistDTO[]>;
  public abstract getUserPlaylistFile: (
    fileId: string,
    userId: string,
    playlistId: string,
  ) => Promise<UserPlaylistFileDTO | null>;
  public abstract insertUserPlaylistFile: ({
    fileId,
    playlistId,
    missingFromRemote,
  }: {
    fileId: string;
    playlistId: string;
    missingFromRemote: boolean;
  }) => Promise<void>;
  public abstract getPlaylistByPlaylistId: (
    playlistId: string,
  ) => Promise<PlaylistDTO | null>;
  public abstract getUserPlaylistFilesAndFileByPlaylistId: (
    playlistId: string,
  ) => Promise<TaggedUserPlaylistFileDTO[]>;
  public abstract updateUserPlaylistFile: (
    fileId: string,
    missingFromRemote: boolean,
  ) => Promise<void>;
}
