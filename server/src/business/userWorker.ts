import { DeviceDTO } from '@src/dtos/deviceDTO';
import { TagMappingPriorityDTO } from '@src/dtos/tagMappingPriorityDTO';
import { UserDTO } from '@src/dtos/userDTO';
import { Config } from '@src/entities/config';
import { User } from '@src/entities/user';
import { iFileDatabase } from '@src/interfaces/iFileDatabase';
import { iUserDatabase } from '@src/interfaces/iUserDatabase';
import { iUserInfoAgent } from '@src/interfaces/iUserInfoAgent';

import { ProcessingError } from './processingError';

export class UserWorker {
  private db: iUserDatabase;
  private dbFile: iFileDatabase;
  private userInfoAgent: iUserInfoAgent;

  constructor(
    db: iUserDatabase,
    dbFile: iFileDatabase,
    userInfoAgent: iUserInfoAgent
  ) {
    this.db = db;
    this.dbFile = dbFile;
    this.userInfoAgent = userInfoAgent;
  }

  public getUser = async (sub: string): Promise<User | null> => {
    const user = await this.db.getUserBySub(sub);
    return user;
  };

  public handleAuthorization = async (
    payload: JSON.JSONObject,
    permissions: Array<string>
  ): Promise<User> => {
    for (const permission of permissions) {
      if (!payload.permissions.includes(permission)) {
        throw new ProcessingError(
          `User does not have permission: ${permission}`
        );
      }
    }
    const dbUser = await this.getUser(payload.sub);
    if (dbUser) {
      return dbUser;
    } else {
      throw new ProcessingError('User not found');
    }
  };

  public registerUser = async (rawToken: string): Promise<User> => {
    const user = await this.userInfoAgent.getUserInfoByToken(rawToken);
    return await this.db.insertUser(user!);
  };

  public registerUserDebug = async (debugToken: UserDTO): Promise<User> => {
    return await this.db.insertUser(debugToken);
  };

  public registerDevice = async (device: DeviceDTO): Promise<DeviceDTO> => {
    return await this.db.insertDevice(device);
  };

  public handleRegistrationDebug = async (
    permissions: Array<string>,
    config: Config
  ): Promise<void> => {
    const debugToken = {
      sub: 'debug',
      permissions: permissions,
    };
    const deviceUUID = '83bdf68c-4f07-40e1-b453-eaf18677f6eb';
    const device = new DeviceDTO(deviceUUID, 'debug', 'debug');
    let user = await this.getUser(debugToken.sub);
    if (!user) {
      const debugTokenDTO = new UserDTO('0', debugToken.sub, 'debug');
      user = await this.registerUserDebug(debugTokenDTO);
      try {
        const priority = TagMappingPriorityDTO.defaultConfiguration(
          user.id,
          config
        );
        await this.db.insertDefaultTagMappingPriority(priority);
        await this.db.insertDefaultUserPlaylist(user.id);
      } catch (error) {
        throw new ProcessingError(`Failed to insert - ${error}`);
      }
    }

    if (await this.db.getDevice(device.id)) {
      throw new ProcessingError('Device is already registered');
    }

    device.user_id = user.id;
    const newDevice = await this.registerDevice(device);

    const userFilesIds = await this.dbFile.getUserFileIds(user.id);
    for (const userFileId of userFilesIds) {
      await this.dbFile.inserSyncrhonizationRecordsByDevice(
        newDevice.id,
        userFileId
      );
    }
  };

  public handleRegistration = async (
    rawToken: string,
    userSub: string,
    device: DeviceDTO,
    config: Config
  ): Promise<void> => {
    let user = await this.getUser(userSub);
    if (!user) {
      user = await this.registerUser(rawToken);
      try {
        const priority = TagMappingPriorityDTO.defaultConfiguration(
          user.id,
          config
        );
        await this.db.insertDefaultTagMappingPriority(priority);
        await this.db.insertDefaultUserPlaylist(user.id);
      } catch (error) {
        throw new ProcessingError(
          'Failed to insert default tag mapping priority'
        );
      }
    }

    if (await this.db.getDevice(device.id)) {
      throw new ProcessingError('Device is already registered');
    }

    device.user_id = user.id;
    const newDevice = await this.registerDevice(device);

    const userFilesIds = await this.dbFile.getUserFileIds(user.id);
    for (const userFileId of userFilesIds) {
      await this.dbFile.inserSyncrhonizationRecordsByDevice(
        newDevice.id,
        userFileId
      );
    }
  };
}
