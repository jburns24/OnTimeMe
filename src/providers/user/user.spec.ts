import { NativeStorage } from '@ionic-native/native-storage';
import { UserProviderMock } from '../../../test-config/user-mocks.ts';
import { UserProvider } from './user.ts';

describe('User Provider', () => {
  let storage = new NativeStorage();
  let user = new UserProvider(storage);
  let userMock = new UserProviderMock(storage);

  // Nothing in storage, calls the method from user.ts
  it('should have nothing in native storage', () => {
    user.getUserInfo().then((retVal) => {
      expect(retVal).toEqual(false);
    });
  });

  // DEBUG: This is a failed test...uncomment to test it out...
  // it('should fail, retVal is <true>, incorrect type', () => {
  //   user.getUserInfo().then((retVal) => {
  //     // No return value of true, this should fail the test
  //     expect(retVal).toEqual(true);
  //   });
  // });

  it('should fail, user.name in storage incorrect', () => {
    userMock.setUser().then((userMockData) => {
      user.getUserInfo().then((user) => {
        expect(userMockData.name).toEqual("blabla");
      });
    });
  });


  // name: 'Test',
  // id: '1',
  // email: 'test@test.com',
  // picture: 'www.test_picture.org',
  // authToken: 'token',
  // serverAuthCode: 'auth_code',
  // isLoggedIn: true
});
