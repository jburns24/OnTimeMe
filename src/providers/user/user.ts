import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage';

@Injectable()
export class UserProvider {
  constructor(private storage: NativeStorage) {
  }

  getUserInfo() : Promise<any> {
    return new Promise(resolve => {
      this.storage.getItem('user').then((data) => {
        console.log("User::getUserInfo(): user is: ", data);
        resolve(data);
      }, (error) => {
        console.log("UserProvider::getUserInfo(): cannot get user info,", error);
      });
    });
  }
}
