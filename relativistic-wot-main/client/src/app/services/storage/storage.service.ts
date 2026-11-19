import { Injectable } from '@angular/core';

import { environment } from '@env/environment';
import { StorageTypeEnum } from './storage-type.enum';

/**
 * Service used to handle the application storage
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  /**
   * The secret key used to encrypt/decrypt the values during storage operations
   */
  private storageSecretKey = '';

  constructor() {
    // Sets the secret key if it has been configured in the environment
    if (environment.storageSecretKey) {
      this.storageSecretKey = environment.storageSecretKey;
    }
  }

  public store(key: string, value: any, storageType: StorageTypeEnum): void {
    const encryptedValue = JSON.stringify(value); // this.encryptObject(value);
    this.getStorage(storageType).setItem(key, encryptedValue);
  }

  public simpleRetrieve(key: string, storageType: StorageTypeEnum): any {
    const encryptedValue = this.getStorage(storageType).getItem(key);
    return encryptedValue; // this.decryptObject(encryptedValue, defaultValue);
  }


  public retrieve(key: string, storageType: StorageTypeEnum): any {
    return this.retrieveOrGetDefault(key, null, storageType);
  }


  public retrieveOrGetDefault(
    key: string,
    defaultValue: any,
    storageType: StorageTypeEnum
  ): any {
    const encryptedValue = this.getStorage(storageType).getItem(key);
    if (encryptedValue) {
      return JSON.parse(encryptedValue); // this.decryptObject(encryptedValue, defaultValue);
    } else {
      return defaultValue;
    }
  }


  public remove(key: string, storageType: StorageTypeEnum): void {
    this.getStorage(storageType).removeItem(key);
  }

  public cleanAll() {
    this.getStorage(StorageTypeEnum.LOCAL_STORAGE).clear();
    this.getStorage(StorageTypeEnum.SESSION_STORAGE).clear();
  }


  private getStorage(storageType: StorageTypeEnum) {
    if (storageType === StorageTypeEnum.SESSION_STORAGE) {
      return sessionStorage;
    } else {
      return localStorage;
    }
  }

  private encryptObject(objectToEncrypt: any): string {
    const textToEncrypt = JSON.stringify(objectToEncrypt);
    let insertPosition = 0;
    while (insertPosition === 0 || insertPosition >= textToEncrypt.length) {
      insertPosition = Math.floor(Math.random() * 100);
    }
    return btoa(
      textToEncrypt.slice(0, insertPosition) +
        this.storageSecretKey +
        textToEncrypt.slice(insertPosition)
    );
  }

  private decryptObject(textToEncrypt: any, defaultValue: any) {
    try {
      return JSON.parse(atob(textToEncrypt).replace(this.storageSecretKey, ''));
    } catch (err) {
      return defaultValue;
    }
  }
}
