import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams , LoadingController, Loading} from 'ionic-angular';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { TabsPage } from '../tabs/tabs';

/**
 * Generated class for the LoginGatePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login-gate',
  templateUrl: 'login-gate.html',
})
export class LoginGatePage {
  loading: Loading;

  constructor(public navCtrl: NavController, public navParams: NavParams,
     private alertCrl: AlertController, private loadingCtrl: LoadingController) {
  }
  
  public createAccount() {
    // register account
    this.navCtrl.setRoot(TabsPage);
  }

  public loginAccount() {
    this.showLoading();
    // attempt login
    this.navCtrl.setRoot(TabsPage);
  }

  showLoading() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...',
      dismissOnPageChange: true
    });
    this.loading.present();
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
}
