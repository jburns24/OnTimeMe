import { Component } from '@angular/core';
import { NavController, MenuController } from 'ionic-angular';
import { GooglePlus } from '@ionic-native/google-plus';
import { LoginGatePage } from '../login-gate/login-gate';
import { PreferencePage } from '../preference/preference';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  // Assign PreferencePage a property so we can use it in the home.html that will
  // take us to the preference page. ** DELETE WHEN MENU IS FULLY IMPLEMENTED!!!
  preference = PreferencePage;

  constructor(public navCtrl: NavController, private googlePlus: GooglePlus,
    private menu: MenuController){
    // After we login and land on the home page enable the menus
    this.enableMenu();
  }

  enableMenu(){
    this.menu.enable(true);
  }

  logout () {
    // google logout
    this.googlePlus.logout();
    this.navCtrl.setRoot(LoginGatePage);
  }
}
