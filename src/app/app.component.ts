/**
 * NOTE: This is the global controller for this app. All that you want to happen
 * globally goes here. Everything that you want to happen eventfully, goes to
 * it's appropriate place. This is the place that will initialize or make things
 * happen each time the app is opened or started. Be careful what you put in here.
 */
import { Component, ViewChild } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
// import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { LoginGatePage } from '../pages/login-gate/login-gate';
import { HomePage } from '../pages/home/home';
import { NativeStorage } from '@ionic-native/native-storage';
import { GooglePlus } from '@ionic-native/google-plus';
import { BackgroundMode } from '@ionic-native/background-mode';

//import { GoogleCalendar } from '../providers/google-calendar/google-calendar';
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
    //private googleCalendar: GoogleCalendar,
    private locationTracker: LocationTracker,
    private backgroundMode: BackgroundMode
  ){
    // This function will initialize the app upon opening the app.
    // Anything you want initialized, do it here!!!!
    this.initializeApp();

    // Set our app's pages in the left menu; Add new pages here!!!
    this.pages = [
      { title: 'Home', component: HomePage, icon:'home' },
      //{ title: 'Preference', component: Preference, icon:'md-settings'}
    ];
  }

  initializeApp(){
    this.platform.ready()
    .then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      //this.statusBar.styleBlackOpaque();

      /*** This is where the logic is implemented for checking user log ins ***/
      this.enableBackgroundMode().then((retVal) => {
        if(retVal){
          console.log("App.comp::initializeApp(): Yes background mode should be on");
        }
      });
      // Before our app can run background mode must be enabled.
      this.backgroundMode.on('enable').subscribe( () => {
        this.locationTracker.startTracking().then(() => {
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
            console.log("App.comp::initializeApp(): user object was not found at login.");
            // Failed, user not logged on, ask him/her to log in
            this.nav.setRoot(LoginGatePage);
            this.splashScreen.hide();
          });
        }, (err) => {
          console.log("App.comp::initializeApp(): Failed to start location ", err);
        });
      });
    }, (err) => {
      console.log(err);
    });
  }


  enableBackgroundMode(){
    return new Promise(resolve => {
      //this.backgroundMode.on('deviceready').subscribe(() => {
        this.backgroundMode.enable();
        resolve(this.checkIfEnable());
      //});
    });
  }

  checkIfEnable(){
    return new Promise(resolve => {
      // DEBUG: check if background mode is enable
      this.backgroundMode.on('enable').subscribe(() => {
        this.backgroundMode.overrideBackButton();
        // this.setBackgroundDefaults();
        // this.backgroundMode.disableWebViewOptimizations();
        // resolve(this.waitForIt());
        resolve(true);
      });
    });
  }

  setBackgroundDefaults(){
    //return new Promise(resolve => {
      // resolve(this.backgroundMode.isEnabled());
      // if (this.backgroundMode.isEnabled()){
        // console.log("APP.COMPONENT::initializeApp(): background mode is enabled.");
        // // Overide the back button to go to background instead of closing the app
        // this.backgroundMode.overrideBackButton();

        // Set the Default values for the background notification mode.
        this.backgroundMode.setDefaults({
          title: 'OnTimeMe is running in the background.',
          text: 'We are helping you be on time.',
          icon: 'icon',
          color: 'F14F4D', // hex format
          resume: true,
          hidden: false,
          bigText: true,
          // To run in background without notification
          silent: false
      });

      // Might need this later:
      // Various APIs like playing media or tracking GPS position in background
      // might not work while in background even the background mode is active.
      // To fix such issues the plugin provides a method to disable most
      // optimizations done by Android/CrossWalk.
      // this.backgroundMode.on('activate', function() {
      //   this.backgroundMode.disableWebViewOptimizations();
      // });
    //     resolve(true);
    //   } else{
    //     console.log("APP.COMPONENT::initializeApp(): background mode is not enabled.");
    //     resolve(false);
    //   };
    // });
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
            //this.googleCalendar.refreshToken = null;
            console.log("refreshToken is successfully removed from native storage.");
            //console.log("refreshToken should now be null", this.googleCalendar.refreshToken);
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
