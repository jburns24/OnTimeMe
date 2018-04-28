import { async, TestBed } from '@angular/core/testing';
import {
  IonicModule,
  Platform,
  MenuController,
  LoadingController,
  AlertController
} from 'ionic-angular';
import { GooglePlus } from '@ionic-native/google-plus';
import { GooglePlusMock } from '@ionic-native-mocks/google-plus';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { NativeStorage } from '@ionic-native/native-storage';
import { NativeStorageMock } from '@ionic-native-mocks/native-storage'
import { LocationTracker } from '../providers/location-tracker/location-tracker';
import { MyApp } from './app.component';
import {
  PlatformMock,
  LocationTrackerMock,
} from '../../test-config/mocks-ionic';
import {
  StatusBarMock,
  SplashScreenMock,
  MenuControllerMock,
  LoadingControllerMock,
  AlertControllerMock,
} from 'ionic-mocks'

describe('MyApp Component', () => {
  let fixture;
  let component;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MyApp],
      imports: [
        IonicModule.forRoot(MyApp)
      ],
      providers: [
        { provide: LocationTracker, useClass: LocationTrackerMock },
        { provide: GooglePlus, useClass: GooglePlusMock },
        { provide: AlertController, useClass: AlertControllerMock },
        { provide: NativeStorage, useClass: NativeStorageMock },
        { provide: MenuController, useClass: MenuControllerMock },
        { provide: StatusBar, useClass: StatusBarMock },
        { provide: SplashScreen, useClass: SplashScreenMock },
        { provide: Platform, useClass: PlatformMock },
        { provide: LoadingController, useClass: LoadingControllerMock }
      ]
    })
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyApp);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component instanceof MyApp).toBe(true);
  });

  it('should have two pages', () => {
    expect(component.pages.length).toBe(1);
  });

});