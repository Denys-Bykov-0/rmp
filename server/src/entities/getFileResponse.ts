import { File } from './file';
import { TagMapping } from './tagMapping';

export class GetFileResponse {
  constructor(
    public readonly file: File,
    public readonly mapping: TagMapping | null
  ) {}
}
