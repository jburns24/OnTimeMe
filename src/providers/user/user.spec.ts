import { NativeStorage } from '@ionic-native/native-storage';
import { UserProviderMock } from '../../../test-config/user-mocks.ts';
import { UserProvider } from './user.ts';

describe('User Provider', () => {

  // Nothing in storage, calls the method from user.ts
  it('should have nothing in native storage', () => {
    let storage = new NativeStorage();
    let user = new UserProvider(storage);
    user.getUserInfo().then((retVal) => {
      expect(retVal.toBe(false))
    });
  });

  it('user name should be \'Test\'', () => {
    let storage = new NativeStorage();
    let userMock = new UserProviderMock(storage);
    userMock.setUser().then((data) => {
      let name = data.name;
      console.log(name);
      expect(name.toBe('Test'));
    });
  });
});
