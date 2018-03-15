import { Component } from '@angular/core';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { GooglePlus } from '@ionic-native/google-plus';
import { NativeStorage } from '@ionic-native/native-storage';
import { HomePage } from '../home/home';
import {
  IonicPage,
  NavController,
  LoadingController,
  Loading,
  MenuController
} from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-login-gate',
  templateUrl: 'login-gate.html',
})
export class LoginGatePage {
  loading: Loading;

  constructor(public navCtrl: NavController, private alertCrl: AlertController,
    private loadingCtrl: LoadingController, private googlePlus: GooglePlus,
    private menu: MenuController, private storage: NativeStorage) {
       // Diable menu in the login gate page
       this.disableMenu();
  }

  public loginAccount() {
    // Create a loading status
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    // Present loading when the login button is pressed
    this.loading.present();
    // Begin google plus login process
    this.googlePlus.login(
      {
        'scopes': 'https://www.googleapis.com/auth/calendar.readonly',
        'webClientId': '311811472759-j2p0u79sv24d7dgmr1er559cif0m7k1j.apps.googleusercontent.com'
      }).then((user) => {
        // Dismiss the loading after login successful
        this.loading.dismiss();
        console.log(user);
        // Add user to native storage, 'user' is the reference name.
        this.storage.setItem('user', {
          name: user.displayName,
          id: user.userId,
          email: user.email,
          picture: user.imageUrl,
          authToken: user.accessToken
        }).then(() => {
          // If user added successfully then go on to home page
          this.navCtrl.setRoot(HomePage);
        }, (error) => {
          // Else user was not added successfully, send error to console
          console.log(error);
        })
      }, (error) => {
        // If google log-in was unsuccessful, then output to console
        // show the error as well.
        console.log(error);
        this.loading.dismiss();
        this.showError(error);
      });
  }

  showError(text) {
    let alert = this.alertCrl.create({
      title: 'Fail',
      subTitle: text,
      buttons: ['OK']
    });
    alert.present();
  }

  // Disable menu in the login gate
  disableMenu(){
    this.menu.enable(false);
  }
}
