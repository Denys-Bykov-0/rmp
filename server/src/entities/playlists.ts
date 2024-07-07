import { Source } from './source';

class Playlist {
  constructor(
    public readonly id: string,
    public readonly source: Source,
    public readonly sourceUrl: string | null,
    public readonly addedTs: Date,
    public readonly status: string,
    public readonly synchronizationTs: Date,
    public readonly title: string
  ) {}
}

export { Playlist };
