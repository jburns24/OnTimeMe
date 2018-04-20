import { NgModule, ErrorHandler } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { GooglePlus } from '@ionic-native/google-plus';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation } from '@ionic-native/geolocation';
import { MyApp } from './app.component';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { NativeStorage } from '@ionic-native/native-storage';
import { DateTimePipe } from '../pipes/date-time/date-time';
import { HoursMinutesSecondsPipe } from '../pipes/hours-minutes-seconds/hours-minutes-seconds';
import { Map } from '../providers/map/map';
import { UserProvider } from '../providers/user/user';
import { GoogleCalendar } from '../providers/google-calendar/google-calendar';
import { Events } from '../providers/events/events';
import { RealTimeClockProvider } from '../providers/real-time-clock/real-time-clock';
import { LocationTracker } from '../providers/location-tracker/location-tracker';
import { Transportation } from '../providers/transportation-mode/transportation-mode';
import { Network } from '@ionic-native/network';
// Pages
import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { LoginGatePage } from '../pages/login-gate/login-gate';
import { TabsPage } from '../pages/tabs/tabs';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { LaunchNavigator } from '@ionic-native/launch-navigator';

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    LoginGatePage,
    DateTimePipe,
    HoursMinutesSecondsPipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    LoginGatePage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    GooglePlus,
    NativeStorage,
    BackgroundGeolocation,
    Geolocation,
    UserProvider,
    GoogleCalendar,
    HttpClient,
    Events,
    Map,
    RealTimeClockProvider,
    LocationTracker,
    Transportation,
    Network,
    LocalNotifications,
    LaunchNavigator,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
  ]
})
export class AppModule {}
