import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { GooglePlus } from '@ionic-native/google-plus'
import { LoginGatePage } from '../login-gate/login-gate'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController, private googlePlus: GooglePlus ){

  }

  logout () {
    // google logout
    this.googlePlus.logout();
    this.navCtrl.setRoot(LoginGatePage);
  }
}
