import { Source } from '@src/entities/source';
import { iSourceDatabase } from '@src/interfaces/iSourceDatabase';
import { SourceMapper } from '@src/mappers/sourceMapper';
import { dataLogger } from '@src/utils/server/logger';

import { ProcessingError } from './processingError';

export class SourceWorker {
  private db: iSourceDatabase;

  constructor(db: iSourceDatabase) {
    this.db = db;
    dataLogger.trace('SourceWorker initialized');
  }

  public getSources = async (): Promise<Array<Source>> => {
    const sources = await this.db.getSources();
    return sources.map((source) => {
      return new SourceMapper().toEntity(source);
    });
  };

  public getSourceLogo = async (sourceId: string): Promise<string> => {
    const source = await this.db.getSource(sourceId);

    if (!source) {
      const opts = {
        message: 'Source not found',
      };
      throw new ProcessingError(opts);
    }
    return source.logoPath;
  };
}
