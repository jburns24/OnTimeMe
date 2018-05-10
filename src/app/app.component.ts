import { Component, ViewChild } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LoginGatePage } from '../pages/login-gate/login-gate';
import { HomePage } from '../pages/home/home';
import { NativeStorage } from '@ionic-native/native-storage';
import { GooglePlus } from '@ionic-native/google-plus';
import { BackgroundModeProvider } from '../providers/background-mode/background-mode'
import { LocationTracker } from '../providers/location-tracker/location-tracker'
import {
  Platform,
  MenuController,
  Nav,
  LoadingController,
  Loading,
  AlertController
} from 'ionic-angular';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  pages;
  rootPage;
  loading: Loading;

  @ViewChild(Nav) nav: Nav;

  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private menu: MenuController,
    private loadingCtrl: LoadingController,
    private storage: NativeStorage,
    private alertCrl: AlertController,
    private googlePlus: GooglePlus,
    private locationTracker: LocationTracker,
    private backgroundMode: BackgroundModeProvider
  ){
    this.initializeApp();
    this.pages = [
      { title: 'Home', component: HomePage, icon:'home' },
    ];
  }

  initializeApp(){
    this.showLoading();
    this.platform.ready()
    .then(() => {
        this.storage.getItem('user')
        .then( (data) => {
          if (data.isLoggedIn == true){
            this.trySilentLogin().then(() => {
              this.dismissLoading();
              this.splashScreen.hide();
              this.nav.setRoot(HomePage);
            }, (err) => {
              console.log("Silent Login Failed", err);
            });
          };
        }, (error) => {
          console.log("App.comp::initializeApp(): user object was not found at login.");
          this.dismissLoading();
          this.splashScreen.hide();
          this.nav.setRoot(LoginGatePage);
        });
    }, (err) => {
      console.log(err);
    });
  }

  showLoading() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...',
      dismissOnPageChange: true
    });
    this.loading.present();
  }

  dismissLoading() {
    this.loading.dismiss();
  }

  showError(text) {
    this.loading.dismiss();

    let alert = this.alertCrl.create({
      title: 'Fail',
      subTitle: text,
      buttons: ['OK']
    });
    alert.present();
  }

  // Need this for menu to work
  openPage(page){
    this.menu.close();
    this.nav.setRoot(page.component);
  }

  trySilentLogin(){
    return this.googlePlus.trySilentLogin({
      'scopes': 'https://www.googleapis.com/auth/calendar.readonly',
      'webClientId': '311811472759-j2p0u79sv24d7dgmr1er559cif0m7k1j.apps.googleusercontent.com'
    }).then ((succ) => {
      console.log("App_comp::trySilentLogin(): successful!");
    }, (error) => {
      console.log ("App_comp::trySilentLogin(): failed!", error);
    });
  }

  logout () {
    this.trySilentLogin().then(() => {
      this.googlePlus.logout().then((response) => {
        this.storage.remove('user').then(() => {
          this.storage.remove('refreshToken').then(() =>{
            console.log("refreshToken is successfully removed from native storage.");
            this.locationTracker.stopTracking().then(() =>{
              this.backgroundMode.disableBackgroundMode().then(() => {
                this.nav.setRoot(LoginGatePage);
              });
            });
          }, (err) => {
            console.log("removing refreshToken errored", err);
          });
        }, (error) => {
          console.log("removing user errored, ", error);
        });
        console.log("successful logout");
      }, (error) => {
        console.log ("Logout error", error);
      });
    });
  }
}
