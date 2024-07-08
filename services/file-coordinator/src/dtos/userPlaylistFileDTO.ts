class UserPlaylistFileDTO {
  constructor(
    public readonly id: string,
    public readonly fileId: string,
    public readonly userPlaylistId: string,
    public readonly missingFromRemote: boolean,
  ) {}

  public static fromJSON(json: JSON.JSONObject): UserPlaylistFileDTO {
    return new UserPlaylistFileDTO(
      json.user_playlist_file_id,
      json.user_playlist_file_file_id,
      json.user_playlist_file_user_playlist_id,
      json.user_playlist_file_missing_from_remote,
    );
  }
}

export { UserPlaylistFileDTO };
