import { async, TestBed, inject } from '@angular/core/testing';
import { UserProvider } from '../../providers/user/user'
import { NativeStorageMock } from '../../mocks/native-storage-mock'
import { NativeStorage } from '@ionic-native/native-storage';
import { IonicModule } from 'ionic-angular';

describe('User Provider Test Suite',() => {
    let user : UserProvider;
    let nativeStorage : NativeStorageMock;

    beforeEach(() => { 
        user = new UserProvider(nativeStorage); 
    });

    it('should be created', () => {
        expect(user instanceof UserProvider).toBe(true);
    });

    it('should return a user object', () => {
        user.getUserInfo().then(response => {
            console.log(response);
            expect(response.isLoggedIn === true).toBe(true);
        });

    });
});