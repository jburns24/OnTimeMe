import { Component } from '@angular/core';
import { NavController, MenuController } from 'ionic-angular';
//import { GooglePlus } from '@ionic-native/google-plus';
//import { LoginGatePage } from '../login-gate/login-gate';
import { NativeStorage } from '@ionic-native/native-storage';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  user: any = null;
  email: any;
  picture: any;

  constructor(
    public navCtrl: NavController, /*private googlePlus: GooglePlus,*/
    private menu: MenuController,
    private storage: NativeStorage){
      // After we login and land on the home page, enable the menu for
      // current user
      this.enableMenu();
      this.getUserInfo();
  }

  enableMenu(){
    this.menu.enable(true);
  }

  getUserInfo(){
    this.storage.getItem('user').then((data) => {
      this.user = data.name;
      this.email = data.email;
      this.picture = data.picture;
      console.log("user is: ", data)
    }, (error) => {
      console.log(error);
    });
  }

  ///////////// NOTE: KEEEEEEEEEPPPPPPPPPPPPP MEEEEEEEEEEEEEEEEE!!!! ///////
  /*// When user logs-out, we must delete the users local profile, to
  // allow our app to know that no user's are logged on. The check for
  // users logged on? is in the app.component.ts file.
  logout () {
    this.googlePlus.trySilentLogin({
      'webClientId': '311811472759-j2p0u79sv24d7dgmr1er559cif0m7k1j.apps.googleusercontent.com'
    }).then ((res) => {
      this.googlePlus.logout().then((response) => {
        this.storage.remove('user');
        this.navCtrl.setRoot(LoginGatePage);
        console.log("successful logout");
      }, (error) => {
        this.googlePlus.disconnect().then ((res) => {
          this.storage.remove('user');
          this.navCtrl.setRoot(LoginGatePage);
          console.log("Successfully disconnected");
        }, (err) => {
          console.log("disconnect error", err);
        });
        console.log ("Logout error", error);
      });
    }, (error) => {
      console.log ("trySilentLogin failed", error);
    });
  }*/
  /////////////////////////////////////////////////////////////////////////////
}
