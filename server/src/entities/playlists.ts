import { Source } from './source';

class Playlist {
  constructor(
    public readonly id: string,
    public readonly source: Source,
    public readonly sourceUrl: string | null,
    public readonly addedTs: Date | null,
    public readonly status: string,
    public readonly synchronizationTs: Date | null,
    public readonly title: string
  ) {}
}

export { Playlist };
