import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler} from 'ionic-angular';
import { GooglePlus } from '@ionic-native/google-plus';
import { MyApp } from './app.component';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { NativeStorage } from '@ionic-native/native-storage';
import { DateTimePipe } from '../pipes/date-time/date-time'

// Pages
import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { LoginGatePage } from '../pages/login-gate/login-gate';
import { PreferencePage } from '../pages/preference/preference';
import { TabsPage } from '../pages/tabs/tabs';
import { UserProvider } from '../providers/user/user';

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    LoginGatePage,
    PreferencePage,
    DateTimePipe
  ],
  imports: [
    BrowserModule,
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
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    NativeStorage,
    UserProvider
  ]
})
export class AppModule {}
