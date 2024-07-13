class UserFileDTO {
  public id: string;
  public userId: string;
  public fileId: string;
  public addedTs: Date;

  constructor(
    id: string,
    userId: string,
    fileId: string,
    addedTs: Date = new Date(),
  ) {
    this.id = id;
    this.userId = userId;
    this.fileId = fileId;
    this.addedTs = addedTs;
  }

  public static fromJSON(json: JSON.JSONObject): UserFileDTO {
    return new UserFileDTO(
      json.user_file_id.toString(),
      json.user_file_file_id.toString(),
      json.user_file_user_id.toString(),
      new Date(json.user_file_added_ts.toString()),
    );
  }
}

export { UserFileDTO };
