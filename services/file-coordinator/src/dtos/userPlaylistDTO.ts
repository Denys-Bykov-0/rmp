class UserPlaylistDTO {
  public id: string;
  public userId: string;
  public playlistId: string;
  public addedTs: Date;

  constructor(id: string, userId: string, playlistId: string, addedTs: Date) {
    this.id = id;
    this.userId = userId;
    this.playlistId = playlistId;
    this.addedTs = addedTs;
  }

  public static fromJSON(json: JSON.JSONObject): UserPlaylistDTO {
    return new UserPlaylistDTO(
      json.id.toString(),
      json.user_id,
      json.playlist_id,
      new Date(json.added_ts)
    );
  }
}

export { UserPlaylistDTO };
