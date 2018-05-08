import { UserProvider } from '../src/providers/user/user.ts';
import { NativeStorage } from '@ionic-native/native-storage';

export class UserProviderMock{
  constructor(private storage: NativeStorage){

  }

  // This method does not exist in non-test class.
  // this is a helper function.
  public setUser(): Promise<any>{
    return new Promise(resolve => {
      this.storage.setItem('user', {
        name: 'Test',
        id: 2,
        email: 'test@test.com',
        picture: 'www.test_picture.org',
        authToken: 'token',
        serverAuthCode: 'auth_code',
        isLoggedIn: true
      })
      .then(() => {
        this.storage.getItem('user').then((data) => {
          resolve(data);
        });
      });
    });
  }
}
