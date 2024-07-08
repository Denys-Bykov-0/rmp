import { Message } from 'amqplib';
import { Logger } from 'log4js';
import pg from 'pg';
import { PluginManager } from '@core/pluginManager';
import { SQLManager } from '@core/sqlManager';
import { FileCoordinatorWorker } from '@business/fileCoordinatorWorker';
import { FileCoordinatorRepository } from '@data/fileCoordinatorRepository';
import { PlaylistRepository } from '@data/playlistRepository';
import { SourceRepository } from '@data/sourceRepository';
import { TagRepository } from '@data/tagRepository';

class FileController {
  private controllerLogger: Logger;
  private businessLogger: Logger;
  private dataLogger: Logger;
  private dbPool: pg.Pool;
  private sqlManager: SQLManager;
  private pluginManager: PluginManager;
  constructor(
    logger: Logger,
    businessLogger: Logger,
    dataLogger: Logger,
    dbPool: pg.Pool,
    sqlManager: SQLManager,
    pluginManager: PluginManager,
  ) {
    this.controllerLogger = logger;
    this.businessLogger = businessLogger;
    this.dataLogger = dataLogger;
    this.dbPool = dbPool;
    this.sqlManager = sqlManager;
    this.pluginManager = pluginManager;
  }
  public buildFileCoordinatorWorker = (): FileCoordinatorWorker => {
    return new FileCoordinatorWorker(
      new FileCoordinatorRepository(
        this.dbPool,
        this.sqlManager,
        this.dataLogger,
      ),
      new TagRepository(this.dbPool, this.sqlManager, this.dataLogger),
      new SourceRepository(this.dbPool, this.sqlManager, this.dataLogger),
      new PlaylistRepository(this.dbPool, this.sqlManager, this.dataLogger),
      this.pluginManager!.getFilePlugin(),
      this.pluginManager!.getTagPlugin(),
      this.businessLogger,
    );
  };

  public handle_message = async (
    message: Message,
    queueName: string,
  ): Promise<void> => {
    try {
      if (queueName === 'checking/file') {
        const { file_id: fileId } = JSON.parse(message.content.toString());
        await this.validateArgs([fileId]);
        await this.coordinateFile(fileId);
      } else if (queueName === 'parsing/playlists/youtube') {
        const { playlist_id: playlistId, files } = JSON.parse(
          message.content.toString(),
        );
        await this.validateArgs([playlistId, files]);
        await this.coordinatePlaylist(playlistId, files);
      }
    } catch (error) {
      this.controllerLogger.error(`Error handling message: ${error}`);
      return;
    }
  };

  public coordinateFile = async (fileId: string): Promise<void> => {
    this.controllerLogger.info(`Processing file ${fileId}`);
    const fileCoordinatorWorker = this.buildFileCoordinatorWorker();
    try {
      await fileCoordinatorWorker.processFile(fileId);
    } catch (error) {
      this.controllerLogger.error(`Error processing file: ${error}`);
      throw new Error(`Error processing file: ${error}`);
    }
  };

  public coordinatePlaylist = async (
    playlistId: string,
    files: string[],
  ): Promise<void> => {
    this.controllerLogger.info(`Processing playlist ${playlistId}`);
    const fileCoordinatorWorker = this.buildFileCoordinatorWorker();
    try {
      await fileCoordinatorWorker.processPlaylist(playlistId, files);
    } catch (error) {
      this.controllerLogger.error(`Error processing playlist: ${error}`);
      throw new Error(`Error processing playlist: ${error}`);
    }
  };

  public validateArgs = async (args: string[]): Promise<void> => {
    for (const arg of args) {
      if (!arg) {
        this.controllerLogger.error('Invalid arguments');
        throw new Error('Invalid arguments');
      }
    }
  };
}

export { FileController };
