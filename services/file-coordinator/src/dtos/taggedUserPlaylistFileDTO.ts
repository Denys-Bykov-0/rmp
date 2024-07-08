import { FileDTO } from './fileDTO';
import { UserPlaylistFileDTO } from './userPlaylistFileDTO';

class TaggedUserPlaylistFileDTO {
  constructor(
    public readonly userPlaylistFile: UserPlaylistFileDTO,
    public readonly file: FileDTO,
  ) {}

  public static fromJSON = (
    json: JSON.JSONObject,
  ): TaggedUserPlaylistFileDTO => {
    return new TaggedUserPlaylistFileDTO(
      UserPlaylistFileDTO.fromJSON(json),
      FileDTO.fromJSON(json),
    );
  };
}

export { TaggedUserPlaylistFileDTO };
