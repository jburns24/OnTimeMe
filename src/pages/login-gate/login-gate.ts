import { Component } from '@angular/core';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { GooglePlus } from '@ionic-native/google-plus'
import { TabsPage } from '../tabs/tabs';
import {
  IonicPage,
  NavController,
  NavParams ,
  LoadingController,
  Loading, Platform,
  MenuController
} from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-login-gate',
  templateUrl: 'login-gate.html',
})
export class LoginGatePage {
  loading: Loading;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private alertCrl: AlertController, private loadingCtrl: LoadingController,
    private googlePlus: GooglePlus, private platform: Platform,
    private menu: MenuController) {
       // Diable menu in the login gate page
       this.ionViewDidEnter();
       this.showLoading();
       this.platform.ready().then(() => {
          this.dismissLoading();
       }, (err) => {
         console.log(err);
       }
      );
  }

  public createAccount() {
    // register account
    this.navCtrl.setRoot(TabsPage);
  }

  public loginAccount() {
    this.googlePlus.login(
      {
        'scopes': 'https://www.googleapis.com/auth/admin.directory.resource.calendar',
        'webClientId': '311811472759-j2p0u79sv24d7dgmr1er559cif0m7k1j.apps.googleusercontent.com',
      }).then((res) => {
        this.showLoading();
        this.navCtrl.setRoot(TabsPage);
        console.log(res);
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

  // Disable menu in the login gate
  ionViewDidEnter(){
    this.menu.enable(false);
  }
}
