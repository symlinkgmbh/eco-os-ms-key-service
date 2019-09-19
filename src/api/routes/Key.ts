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



import { AbstractRoutes, injectValidatorService } from "@symlinkde/eco-os-pk-api";
import { PkApi } from "@symlinkde/eco-os-pk-models";
import { Application, Request, Response, NextFunction } from "express";
import { KeyController } from "../controllers";

@injectValidatorService
export class KeyRoute extends AbstractRoutes implements PkApi.IRoute {
  private keyController: KeyController;
  private validatorService!: PkApi.IValidator;
  private postKeyPattern: PkApi.IValidatorPattern = {
    pubKey: "",
    deviceId: "",
    email: "",
  };

  constructor(app: Application) {
    super(app);
    this.keyController = new KeyController();
    this.activate();
  }

  public activate(): void {
    this.getUsersKeysByEmail();
    this.revokeKeysFromUserByEmail();
    this.revokeKeysFromUserByKey();
    this.revokeKeyFromUserByDeviceId();
    this.revokeAllKeys();
    this.addKeyToUserByEmail();
  }

  private getUsersKeysByEmail(): void {
    this.getApp()
      .route("/key/:email")
      .get((req: Request, res: Response, next: NextFunction) => {
        this.keyController
          .getUsersKeysByEmail(req)
          .then((result) => {
            res.send(result);
          })
          .catch((err) => {
            next(err);
          });
      });
  }

  private revokeKeysFromUserByEmail(): void {
    this.getApp()
      .route("/key/:email")
      .delete((req: Request, res: Response, next: NextFunction) => {
        this.keyController
          .revokeKeysFromUserByEmail(req)
          .then((result) => {
            res.send(result);
          })
          .catch((err) => {
            next(err);
          });
      });
  }

  private revokeKeysFromUserByKey(): void {
    this.getApp()
      .route("/revoke/key/:pubKey")
      .delete((req: Request, res: Response, next: NextFunction) => {
        this.keyController
          .revokeKeysFromUserByKey(req)
          .then(() => {
            res.sendStatus(200);
          })
          .catch((err) => {
            next(err);
          });
      });
  }

  private revokeKeyFromUserByDeviceId(): void {
    this.getApp()
      .route("/revoke/device/:deviceId")
      .delete((req: Request, res: Response, next: NextFunction) => {
        this.keyController
          .revokeKeyFromUserByDeviceId(req)
          .then(() => {
            res.sendStatus(200);
          })
          .catch((err) => {
            next(err);
          });
      });
  }

  private revokeAllKeys(): void {
    this.getApp()
      .route("/keys")
      .delete((req: Request, res: Response, next: NextFunction) => {
        this.keyController
          .revokeAllKeys()
          .then(() => {
            res.sendStatus(200);
          })
          .catch((err) => {
            next(err);
          });
      });
  }

  private addKeyToUserByEmail(): void {
    this.getApp()
      .route("/key")
      .post((req: Request, res: Response, next: NextFunction) => {
        this.validatorService.validate(req.body, this.postKeyPattern);
        this.keyController
          .addKeyToUserByEmail(req)
          .then((result) => {
            res.send(result);
          })
          .catch((err) => {
            next(err);
          });
      });
    return;
  }
}
