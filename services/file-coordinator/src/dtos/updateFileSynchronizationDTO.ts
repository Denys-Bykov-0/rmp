class UpdateFileSynchronizationDTO {
  constructor(
    readonly timestamp: string,
    readonly userFileId: string,
    readonly isSynchronized?: boolean,
    readonly wasChanged?: boolean,
    readonly deviceId?: string,
  ) {}

  public static fromJSON(json: JSON.JSONObject): UpdateFileSynchronizationDTO {
    return new UpdateFileSynchronizationDTO(
      json.timestamp,
      json.userFileId,
      json.isSynchronized,
      json.wasChanged,
      json.deviceId,
    );
  }
}

export { UpdateFileSynchronizationDTO };
