import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage';

@Injectable()
export class UserProvider {
  name: string;
  email: string;
  picture: any;
  id: any;
  authToken: string;
  isLoggedIn: boolean = false;
  serverAuthCode: string;

  constructor(private storage: NativeStorage) {
  }

  getUserInfo(){
    return this.storage.getItem('user').then((data) => {
      this.name = data.name;
      this.email = data.email;
      this.picture = data.picture;
      this.id = data.id,
      this.authToken = data.authToken,
      this.serverAuthCode = data.serverAuthCode,
      this.isLoggedIn = data.isLoggedIn
      console.log("user is: ", data)
    }, (error) => {
      console.log(error);
    });
  }
}
