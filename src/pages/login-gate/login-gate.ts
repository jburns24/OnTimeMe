import { Component } from '@angular/core';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { GooglePlus } from '@ionic-native/google-plus';
import { NativeStorage } from '@ionic-native/native-storage';
import { HomePage } from '../home/home';
import { Network } from '@ionic-native/network';
import { BackgroundModeProvider } from '../../providers/background-mode/background-mode';
import { LocationTracker } from '../../providers/location-tracker/location-tracker'
import {
  IonicPage,
  NavController,
  LoadingController,
  Loading,
  MenuController,
  ToastController,
  Platform
} from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-login-gate',
  templateUrl: 'login-gate.html',
})
export class LoginGatePage {
  loading: Loading;
  onToast: any;
  offToast: any;
  enableLogin: boolean;
  connected: any;
  disconnected: any;
  locationServicesOn: any;

  constructor(public navCtrl: NavController, private alertCrl: AlertController,
    private loadingCtrl: LoadingController, private googlePlus: GooglePlus,
    private menu: MenuController, private storage: NativeStorage,
    private toast: ToastController, private network: Network,
    private locationTracker: LocationTracker,
    private platform: Platform,
    private backgroundMode: BackgroundModeProvider) {
      // Diable menu in the login gate page
      this.disableMenu();

      this.platform.resume.subscribe(() => {
        let view = this.navCtrl.getActive().name;
        if(view == "LoginGatePage"){
          console.log("Rusuming from LoginGatePage...");
          this.isLocationEnabled();
        };
      });

      this.platform.pause.subscribe(() => {
        let view = this.navCtrl.getActive().name;
        if(view == "LoginGatePage"){
          console.log("Paused from LoginGatePage...");
          this.locationTracker.stopTracking();
        };
      });
  }

  ionViewCanEnter(){
    console.log("LoginGate::ionViewCanEnter(): ran.");
    if(this.backgroundMode.backgroundMode.isEnabled()){
      this.backgroundMode.disableBackgroundMode();
    };
    this.isLocationEnabled();
  }

  ionViewWillEnter(){
    if(this.network.type == 'none'){
      this.enableLogin = false;
      console.log("Login::ionViewWillEnter(): we are offline");
    } else {
      this.enableLogin = true;
    };
  }

  ionViewDidEnter(){
    this.disconnected = this.network.onDisconnect().subscribe(data => {
      console.log("Login::ionViewDidEnter(): disconncted from internet,", data);
      this.enableLogin = false;
      this.onDisconnectUpdate();
    }, (error) => {
      console.log("Login::ionViewDidEnter(): error on disconnect,", error);
    });

    this.connected = this.network.onConnect().subscribe(data =>{
      console.log("Login::ionViewDidEnter(): connected to internet,", data);
      this.enableLogin = true;
      this.onConnectUpdate(data.type);
    }, (error) => {
      console.log("Login::ionViewDidEnter(): error,", error);
    });
  }

  ionViewWillLeave(){
    this.connected.unsubscribe();
    this.disconnected.unsubscribe();
  }

  onConnectUpdate(connectionState: string){
    let networkType = this.network.type;
    this.onToast = this.toast.create({
      message: 'You are now connected ' + connectionState + ' via '+ networkType,
      duration: 5000
    });
    this.onToast.present();
  }

  onDisconnectUpdate(){
    this.offToast = this.toast.create({
      message: 'You are offline. You need network connection to use this app.',
      position: 'bottom',
      duration: 5000,
    });
    this.offToast.present();
  }

  loginAccount() {
    if (this.enableLogin){
      // Create a loading status
      let loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      // Present loading when the login button is pressed
      loading.present();
      // Begin google plus login process
      this.googlePlus.login(
        {
          'scopes': 'https://www.googleapis.com/auth/calendar.readonly',
          'webClientId': '311811472759-j2p0u79sv24d7dgmr1er559cif0m7k1j.apps.googleusercontent.com',
          'offline': true
        }).then((user) => {
          // Dismiss the loading after login successful
          loading.dismiss();
          console.log(user);
          // Add user to native storage, 'user' is the reference name.
          this.storage.setItem('user', {
            name: user.displayName,
            id: user.userId,
            email: user.email,
            picture: user.imageUrl,
            authToken: user.accessToken,
            serverAuthCode: user.serverAuthCode,
            isLoggedIn: true
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
          console.log("Cannot login, ", error);
          loading.dismiss();
          this.showError(error);

        });
    }
    else{
      this.onDisconnectUpdate();
    }
  }

  isLocationEnabled(){
    return new Promise(resolve => {
      this.locationTracker.isLocationEnabled().then((retVal) => {
        if(retVal){
          this.locationTracker.startTracking().then(() => {
            console.log("LoginGate:: started tracking...");
            resolve(true);
          });
        } else {
          this.locationTracker.enableLocationServices();
          resolve(false);
        };
      });
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
