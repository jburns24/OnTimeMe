/**
 * NOTE: This is the global controller for this app. All that you want to happen
 * globally goes here. Everything that you want to happen eventfully, goes to
 * it's appropriate place. This is the place that will initialize or make things
 * happen each time the app is opened or started. Be careful what you put in here.
 */
import { Component, ViewChild } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { LoginGatePage } from '../pages/login-gate/login-gate';
import { HomePage } from '../pages/home/home';
import { Preference } from '../pages/preference/preference';
import { NativeStorage } from '@ionic-native/native-storage';
import { GooglePlus } from '@ionic-native/google-plus';
import { GoogleCalendar } from '../providers/google-calendar/google-calendar';
import { LocationTracker } from '../providers/location-tracker/location-tracker'
import {
  Platform,
  MenuController,
  Nav,
  LoadingController,
  Loading
} from 'ionic-angular';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  pages;
  rootPage;
  loading: Loading;

  // For use with login and logout (logic implementation)
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
    private googleCalendar: GoogleCalendar,
    private locationTracker: LocationTracker
  ){
    // This function will initialize the app upon opening the app.
    // Anything you want initialized, do it here!!!!
    this.initializeApp();

    // Set our app's pages in the left menu; Add new pages here!!!
    this.pages = [
      { title: 'Home', component: HomePage, icon:'home' },
      { title: 'Preference', component: Preference, icon:'md-settings'}
    ];

    // Set the app to land on the login page as soon as launch
    this.rootPage = LoginGatePage;
  }

  initializeApp(){
    this.platform.ready()
    .then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleBlackOpaque();

      /*** This is where the logic is implemented for checking user log ins ***/
      this.storage.getItem('user') // Try to get item from local storage and...
      .then( (data) => {
        // Logic checks if users are logged in...this is the place
        // to do all your init() and dummy calls if these calls depends on
        // user being logged in. This is mainly for when user didn't log out
        // and you need to re-init() stuff.
        if (data.isLoggedIn == true){
          this.trySilentLogin().then(() => {
            // Succeed, profile exists...allow that person to access his/her data
            this.nav.setRoot(HomePage);
            this.splashScreen.hide();
          }, (err) => {
            console.log("Silent Login Failed", err);
          });
        };
      }, (error) => {
        console.log("App.comp::initializeApp() user object was not found at login.");
        // Failed, user not logged on, ask him/her to log in
        this.nav.setRoot(LoginGatePage);
        this.splashScreen.hide();
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

  // When user logs-out, we must delete the users local profile, to
  // allow our app to know that no user's are logged on. The check for
  // users logged on? is in the app.component.ts file.
  logout () {
    //this.locationTracker.stopTracking();
    return this.trySilentLogin().then(() => {
      this.googlePlus.logout().then((response) => {
        this.storage.remove('user').then(() => {
          this.storage.remove('refreshToken').then(() =>{
            this.googleCalendar.refreshToken = null;
            console.log("refreshToken is successfully removed from native storage.");
            console.log("refreshToken should now be null", this.googleCalendar.refreshToken);
            this.nav.setRoot(LoginGatePage).then(() =>{
              // DEBUGGING: this part below
              this.locationTracker.stopTracking().then(() =>{
                this.storage.getItem('refreshToken').then((res) => {
                  console.log("trying to get refresh token after it has been removed", (res));
                }, (error) => {
                  console.log("This is what we want, refresh token cannot be found after it gets deleted.", error);
                });
              });
            });
            /////////////// DEBUGGING ENDS ////////////////////////
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
