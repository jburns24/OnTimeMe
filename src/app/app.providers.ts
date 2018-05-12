import { ErrorHandler } from '@angular/core';
import { IonicErrorHandler , MenuController, LoadingController, AlertController, Alert} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { GooglePlus } from '@ionic-native/google-plus';
import { GooglePlusMock } from '@ionic-native-mocks/google-plus';
import { NativeStorage } from '@ionic-native/native-storage';
import { NativeStorageMock } from '@ionic-native-mocks/native-storage'
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { BackgroundGeolocatioMock } from '@ionic-native-mocks/background-geolocation'
import { Geolocation } from '@ionic-native/geolocation';
import { GeolocationMock } from '@ionic-native-mocks/geolocation'
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Network } from '@ionic-native/network';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { BackgroundMode } from '@ionic-native/background-mode';
import { BackgroundModeProvider } from '../providers/background-mode/background-mode';
import { NativeGeocoder } from '@ionic-native/native-geocoder';

//import { LocalNotificationsMocks } from '@ionic-native-mocks/local-notifications'
import { LaunchNavigator } from '@ionic-native/launch-navigator';
import { LaunchNavigatorMock } from '@ionic-native-mocks/launch-navigator'
import {
    NetworkMock,
    StatusBarMock,
    SplashScreenMock,
    MenuControllerMock,
    LoadingControllerMock,
    AlertControllerMock, } from 'ionic-mocks';


//  Need Mocks for
import { UserProvider } from '../providers/user/user';
import { GoogleCalendar } from '../providers/google-calendar/google-calendar';
import { Map } from '../providers/map/map';
import { Events } from '../providers/events/events';
import { RealTimeClockProvider } from '../providers/real-time-clock/real-time-clock';
import { LocationTracker } from '../providers/location-tracker/location-tracker';
import { Transportation } from '../providers/transportation-mode/transportation-mode';

export class AppProviders {

    public static getProviders() {

        let providers;

        if(document.URL.includes('https://') || document.URL.includes('http://')){

          // Use browser providers
          providers = [
            Transportation,
            LocationTracker,
            RealTimeClockProvider,
            Events,
            Map,
            GoogleCalendar,
            UserProvider,

            //  Should be a mock
            LocalNotifications,


            {provide: AlertController, useClass: AlertControllerMock},
            {provide: LoadingController, useClass: LoadingControllerMock},
            {provide: MenuController, useClass: MenuControllerMock},
            {provide: LaunchNavigator, useClass: LaunchNavigatorMock},
            //{provide: LocalNotifications, useClass: LocalNotificationsMocks},
            {provide: Network, useClass: NetworkMock},
            {provide: HttpClient, useClass: HttpClientTestingModule},
            {provide: Geolocation, useClass: GeolocationMock},
            {provide: BackgroundGeolocation, useClass: BackgroundGeolocatioMock},
            {provide: NativeStorage, useClass: NativeStorageMock},
            {provide: GooglePlus, useClass: GooglePlusMock},
            {provide: StatusBar, useClass: StatusBarMock},
            {provide: SplashScreen, useClass: SplashScreenMock},
            {provide: ErrorHandler, useClass: IonicErrorHandler}
          ];

        } else {

          // Use device providers
          providers = [
            AlertController,
            LoadingController,
            MenuController,
            Transportation,
            LocationTracker,
            RealTimeClockProvider,
            Events,
            Map,
            GoogleCalendar,
            UserProvider,
            LaunchNavigator,
            LocalNotifications,
            Network,
            HttpClient,
            Geolocation,
            BackgroundGeolocation,
            NativeStorage,
            GooglePlus,
            SplashScreen,
            StatusBar,
            BackgroundMode,
            BackgroundModeProvider,
            NativeGeocoder,
            {provide: ErrorHandler, useClass: IonicErrorHandler}
          ];

        }

        return providers;

    }

}
