class FileSynchronizationDTO {
  constructor(
    public readonly deviceId: string,
    public readonly userFileId: string,
    public readonly isSynchronized: boolean,
    public readonly serverTs: string,
    public readonly deviceTs: string,
    public readonly wasChanged: boolean
  ) {}

  public static fromJSON(json: JSON.JSONObject): FileSynchronizationDTO {
    return new FileSynchronizationDTO(
      json.device_id,
      json.user_file_id,
      json.is_synchronized,
      json.server_ts,
      json.device_ts,
      json.was_changed
    );
  }
}

export { FileSynchronizationDTO };
