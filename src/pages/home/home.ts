import { Component } from '@angular/core';
import { NavController, MenuController } from 'ionic-angular';
import { GooglePlus } from '@ionic-native/google-plus';
import { LoginGatePage } from '../login-gate/login-gate';
import { PreferencePage } from '../preference/preference';
import { NativeStorage } from '@ionic-native/native-storage';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  // Assign PreferencePage a property so we can use it in the home.html that will
  // take us to the preference page. ** DELETE WHEN MENU IS FULLY IMPLEMENTED!!!
  preference = PreferencePage;

  constructor(public navCtrl: NavController, private googlePlus: GooglePlus,
    private menu: MenuController, private storage: NativeStorage){
    // After we login and land on the home page, enable the menu for current user
    this.enableMenu();
  }

  enableMenu(){
    this.menu.enable(true);
  }

  // When user logs-out, we must delete the users local profile, to
  // allow our app to know that no user's are logged on. The check for
  // users logged on? is in the app.component.ts file.
  logout () {
    // google logout
    this.googlePlus.logout().then((user) => {
      this.storage.remove('user');
      // After delete of user profile then go to login gate page
      this.navCtrl.setRoot(LoginGatePage);
    }, (error) => {
      console.log(error);
    });
  }
}
