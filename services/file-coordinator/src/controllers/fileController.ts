import { FileCoordinatorWorker } from '@business/fileCoordinatorWorker';
import { SQLManager } from '@core/sqlManager';
import { FileCoordinatorRepository } from '@data/fileCoordinatorRepository';
import { Message } from 'amqplib';
import { UUID } from 'crypto';
import { Logger } from 'log4js';
import pg from 'pg';

class FileController {
  private controllerLogger: Logger;
  private businessLogger: Logger;
  private dataLogger: Logger;
  private dbPool: pg.Pool;
  private sqlManager: SQLManager;
  constructor(
    logger: Logger,
    businessLogger: Logger,
    dataLogger: Logger,
    dbPool: pg.Pool,
    sqlManager: SQLManager
  ) {
    this.controllerLogger = logger;
    this.businessLogger = businessLogger;
    this.dataLogger = dataLogger;
    this.dbPool = dbPool;
    this.sqlManager = sqlManager;
  }
  public buildFileCoordinatorWorker = (): FileCoordinatorWorker => {
    return new FileCoordinatorWorker(
      new FileCoordinatorRepository(
        this.dbPool,
        this.sqlManager,
        this.dataLogger
      ),
      this.businessLogger
    );
  };

  public handle_message = async (message: Message): Promise<void> => {
    try {
      const { fileId, userId, deviceId } = JSON.parse(
        message.content.toString()
      );
      if (!fileId || !userId || !deviceId) {
        this.controllerLogger.error(
          `Invalid message - ${message.content.toString()}`
        );
        return;
      }
      await this.coordinateFile(fileId, userId, deviceId);
    } catch (error) {
      this.controllerLogger.error(`Error handling message: ${error}`);
      return;
    }
  };

  public coordinateFile = async (
    fileId: string,
    userId: string,
    deviceId: UUID
  ): Promise<void> => {
    this.controllerLogger.info(
      `Processing file ${fileId} for user ${userId} and device ${deviceId}`
    );
    const fileCoordinatorWorker = this.buildFileCoordinatorWorker();
    try {
      await fileCoordinatorWorker.processFile(fileId, userId, deviceId);
    } catch (error) {
      this.controllerLogger.error(`Error coordinating file: ${error}`);
      throw new Error(`Error coordinating file: ${error}`);
    }
  };
}

export { FileController };
