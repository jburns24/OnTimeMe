import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { GooglePlus } from '@ionic-native/google-plus';
import { LoginGatePage } from '../login-gate/login-gate';

// Since root page is the page we will land on after we land
// on after we log in, then lets add a button to set preference
// in here that will take us to the preference page.
import { PreferencePage } from '../preference/preference';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  // Assign PreferencePage a property so we can use it in the home.html that will
  // take us to the preference page.
  preference = PreferencePage;

  constructor(public navCtrl: NavController, private googlePlus: GooglePlus ){

  }

  logout () {
    // google logout
    this.googlePlus.logout();
    this.navCtrl.setRoot(LoginGatePage);
  }
}
