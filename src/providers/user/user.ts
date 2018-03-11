import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage';

@Injectable()
export class UserProvider {
  name: any;
  email: any;
  picture: any;
  id: any;

  constructor(private storage: NativeStorage) {
  }

  getUserInfo(){
    this.storage.getItem('user').then((data) => {
      this.name = data.name;
      this.email = data.email;
      this.picture = data.picture;
      this.id = data.id
      console.log("user is: ", data)
    }, (error) => {
      console.log(error);
    });
  }
}
