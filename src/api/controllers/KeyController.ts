/**
 * Copyright 2018-2019 Symlink GmbH
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 */



import { Request } from "express";
import { injectKeyService } from "@symlinkde/eco-os-pk-storage-key";
import { CustomRestError, apiResponseCodes } from "@symlinkde/eco-os-pk-api";
import { injectUserClient } from "@symlinkde/eco-os-pk-core";
import { PkCore, MsKey, PkStorageKey, MsOverride } from "@symlinkde/eco-os-pk-models";

@injectUserClient
@injectKeyService
export class KeyController {
  private keyService!: PkStorageKey.IKeyService;
  private userClient!: PkCore.IEcoUserClient;

  public async getUsersKeysByEmail(req: MsOverride.IRequest): Promise<Array<MsKey.IKey>> {
    try {
      const response = await this.userClient.loadUserByEmail(req.params.email);
      if (response.data.isActive === false) {
        throw new CustomRestError(
          {
            code: apiResponseCodes.C817.code,
            message: apiResponseCodes.C817.message,
          },
          400,
        );
      }
    } catch (err) {
      throw new CustomRestError(
        {
          code: apiResponseCodes.C818.code,
          message: apiResponseCodes.C818.message,
        },
        400,
      );
    }

    const result = await this.keyService.getPubKeys(req.params.email);

    if (result === null || result.length < 1) {
      throw new CustomRestError(
        {
          code: apiResponseCodes.C819.code,
          message: apiResponseCodes.C819.message,
        },
        404,
      );
    }

    return result;
  }

  public async revokeKeysFromUserByKey(req: MsOverride.IRequest): Promise<void> {
    await this.keyService.revokePubKeyByKey(req.params.pubKey);
  }

  public async revokeKeyFromUserByDeviceId(req: MsOverride.IRequest): Promise<void> {
    await this.keyService.revokePubKeyByDeviceId(req.params.deviceId);
  }

  public async revokeAllKeys(): Promise<void> {
    await this.keyService.revokeAllPubKeys();
  }

  public async addKeyToUserByEmail(req: Request): Promise<void> {
    const key: MsKey.IKey = req.body;
    const exists = await this.keyService.checkForKeyAndDeviceId(key.pubKey, key.deviceId);
    if (exists) {
      throw new CustomRestError(
        {
          code: apiResponseCodes.C820.code,
          message: apiResponseCodes.C820.message,
        },
        400,
      );
    }
    const result = await this.keyService.addPubKey(key.email, key.pubKey, key.deviceId);
    if (result === null) {
      throw new CustomRestError(
        {
          code: apiResponseCodes.C852.code,
          message: apiResponseCodes.C852.message,
        },
        400,
      );
    }
  }

  public async revokeKeysFromUserByEmail(req: MsOverride.IRequest): Promise<void> {
    try {
      await this.keyService.revokePubKeys(req.params.email);
    } catch (err) {
      throw new CustomRestError(
        {
          code: apiResponseCodes.C853.code,
          message: apiResponseCodes.C853.message,
        },
        400,
      );
    }
  }

  public async deleteDevice(req: MsOverride.IRequest): Promise<void> {
    try {
      await this.keyService.revokeDevice(req.params.deviceId);
    } catch (err) {
      throw new CustomRestError(
        {
          code: apiResponseCodes.C854.code,
          message: apiResponseCodes.C854.message,
        },
        404,
      );
    }
  }
}
