import fs from 'fs';
import { FileController } from '@controllers/fileController';
import dotenv from 'dotenv';
import pg from 'pg';
import { AMQPConsumer } from '@core/amqpConsumer';
import { PluginManager } from '@core/pluginManager';
import { SQLManager } from '@core/sqlManager';
import { Config } from '@entities/config';
import { ConnectionValidator } from '@utils/connectionValidator';
import {
  amqpLogger,
  appLogger,
  businessLogger,
  controllerLogger,
  dataLogger,
} from '@utils/logger';
import { parseJSONConfig } from '@utils/parseJSONConfig';

class App {
  private config: Config;
  private dbPool: pg.Pool;
  private amqpConfigConnection: string;
  private sqlManager: SQLManager;
  private pluginManager: PluginManager;
  constructor(config: Config) {
    this.config = config;
    this.dbPool = new pg.Pool({
      host: this.config.dbHost,
      port: this.config.dbPort,
      user: this.config.dbUser,
      password: this.config.dbPassword,
      database: this.config.dbName,
      max: this.config.dbMax,
    });
    this.amqpConfigConnection =
      `amqp://${this.config.rabbitMQUser}:${this.config.rabbitMQPassword}` +
      `@${this.config.rabbitMQHost}:${this.config.rabbitMQPort}`;
    this.sqlManager = new SQLManager(controllerLogger, controllerLogger);
    this.pluginManager = new PluginManager(this.config, dataLogger, appLogger);
  }

  public setUp = async (): Promise<void> => {
    appLogger.info('Starting the application...');
    try {
      const connectionValidator = new ConnectionValidator(
        this.config,
        appLogger,
      );
      await connectionValidator.validateConnections(
        this.dbPool,
        this.amqpConfigConnection,
      );
      this.sqlManager.setUp();
      await this.pluginManager.setUp();
    } catch (error) {
      appLogger.error(error);
      throw new Error('Error setting up the application');
    }
  };

  public start = async (): Promise<void> => {
    await this.setUp();
    const amqpConsumer = new AMQPConsumer(this.config, amqpLogger);
    const fileController = new FileController(
      controllerLogger,
      businessLogger,
      dataLogger,
      this.dbPool,
      this.sqlManager,
      this.pluginManager,
    );
    await amqpConsumer.consume(
      this.amqpConfigConnection,
      'checking/file',
      fileController.handle_message,
    );
    await amqpConsumer.consume(
      this.amqpConfigConnection,
      'playlist/update',
      fileController.handle_message,
    );
  };
}

const env = dotenv.config({ path: 'config/.env' }).parsed || {};
const configJson = parseJSONConfig(
  JSON.parse(fs.readFileSync('config/config.json', 'utf-8')),
);
const config = new Config(env, configJson);
const app = new App(config);
app.start();
