import { Config } from '@entities/config';
import amqp, {
  Channel,
  Connection,
  Message,
  Replies,
} from 'amqplib/callback_api';
import { Logger } from 'log4js';

class AMQPConsumer {
  private config: Config;
  private logger: Logger;
  constructor(config: Config, logger: Logger) {
    this.config = config;
    this.logger = logger;
  }

  private connectToAMQP = async (
    amqpConfigConnection: string,
  ): Promise<Connection> => {
    return new Promise((resolve, reject) => {
      amqp.connect(amqpConfigConnection, (err, connection) => {
        if (err) {
          this.logger.error(
            `Error connecting to AMQP at ${this.config.rabbitMQHost}`,
          );
          reject(err);
        } else {
          this.logger.info(
            `Connected to AMQP at ${this.config.rabbitMQHost}:${this.config.rabbitMQPort}`,
          );
          resolve(connection);
        }
      });
    });
  };

  private createChannel = async (connection: Connection): Promise<Channel> => {
    return new Promise((resolve, reject) => {
      connection.createChannel((err, channel) => {
        if (err) {
          this.logger.error(`Error creating channel - ${err}`);
          reject(err);
        } else {
          this.logger.info('Channel created');
          resolve(channel);
        }
      });
    });
  };

  private assertQueue = async (
    channel: Channel,
    queueName: string,
  ): Promise<Replies.AssertQueue> => {
    return new Promise((resolve, reject) => {
      channel.assertQueue(
        queueName,
        { durable: true },
        (err: Error, q: Replies.AssertQueue) => {
          if (err) {
            this.logger.error(`Error asserting queue - ${err}`);
            reject(err);
          } else {
            this.logger.info(`Queue ${q.queue} asserted`);
            resolve(q);
          }
        },
      );
    });
  };

  public consume = async (
    amqpConfigConnection: string,
    queueName: string,
    callback: (msg: Message, queueName: string) => void,
  ) => {
    const connection = await this.connectToAMQP(amqpConfigConnection);
    const channel = await this.createChannel(connection);
    const q = await this.assertQueue(channel, queueName);
    channel.consume(
      q.queue,
      (msg: Message | null) => {
        if (msg) {
          callback(msg, queueName);
        }
      },
      { noAck: true },
    );
  };
}

export { AMQPConsumer };
