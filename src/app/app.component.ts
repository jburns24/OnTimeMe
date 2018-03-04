import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { LoginGatePage } from '../pages/login-gate/login-gate';
import { HomePage } from '../pages/home/home';
import { PreferencePage } from '../pages/preference/preference';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  pages;
  rootPage;

  // For use with login and logout (logic implementation)
  @ViewChild(Nav) nav: Nav;

  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private menu: MenuController
  ){
    // This function will initialize the app upon opening app
    this.initializeApp();

    // Set our app's pages in the left menu; Add new pages here!!!
    this.pages = [
      { title: 'Home', component: HomePage, icon:'home' },
      { title: 'Preference', component: PreferencePage }
    ];

    // Set the app to land on the login page as soon as launch
    this.rootPage = LoginGatePage;
  }

  initializeApp(){
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });

    /* Adding logic to check if user is logged in or not.
    this.auth.afAuth.authState.subscribe(
      user => {
        if (user) {
          this.rootPage = HomePage;
        }
        else {
          this.rootPage = LoginGatePage;
        }
      },
      () => {
        this.rootPage = LoginGatePage;
      }
    );*/
  }
  // Need this for menu to work
  openPage(page){
    this.menu.close();
    this.nav.setRoot(page.component);
  }
}
