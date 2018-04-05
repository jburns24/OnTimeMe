import { NgModule, ErrorHandler } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler} from 'ionic-angular';
import { GooglePlus } from '@ionic-native/google-plus';
import { MyApp } from './app.component';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { NativeStorage } from '@ionic-native/native-storage';
import { DateTimePipe } from '../pipes/date-time/date-time';
import { HoursMinutesSecondsPipe } from '../pipes/hours-minutes-seconds/hours-minutes-seconds';
import { Geolocation } from '@ionic-native/geolocation';
import { Map } from '../providers/map/map';

// Pages
import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { LoginGatePage } from '../pages/login-gate/login-gate';
import { PreferencePage } from '../pages/preference/preference';
import { TabsPage } from '../pages/tabs/tabs';
import { UserProvider } from '../providers/user/user';
import { GoogleCalendar } from '../providers/google-calendar/google-calendar';
import { Events } from '../providers/events/events';



@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    LoginGatePage,
    PreferencePage,
    DateTimePipe,
    HoursMinutesSecondsPipe,
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
    PreferencePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    GooglePlus,
    NativeStorage,
    UserProvider,
    GoogleCalendar,
    HttpClient,
    Events,
    Map,
    Geolocation,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
