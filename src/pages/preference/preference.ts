import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AlertController, ViewController } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';



@IonicPage()
@Component({
  selector: 'page-preference',
  templateUrl: 'preference.html',
})
export class PreferencePage {
  transMode: any;
  flag: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCrl: AlertController,
    public viewCtrl: ViewController,
    public storage: NativeStorage) {
      // Call getMode to get the current selected or default
      // transportation mode each time the preference page is opened.
      this.getMode();
  }

  showRadioAlert(){
    let alert = this.alertCrl.create();
    alert.setTitle('Select Transportation Mode');

    alert.addInput({
      type: 'radio',
      label: 'Car',
      value: 'Car',
      checked: true
    });
    alert.addInput({
      type: 'radio',
      label: 'Bike',
      value: 'Bike',
      checked: false
    });
    alert.addInput({
      type: 'radio',
      label: 'Walk',
      value: 'Walk',
      checked: false
    });

    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK',
      handler: data => {
        // Get the current user id and mode. Store it into the native storage
        // as a key value pair.
        this.storage.getItem('user').then( (user) => {
          this.storage.setItem(user.id, data);
          //////////////// DEBUG: check the value /////////////////
          this.storage.getItem(user.id).then( (mode) => {
          console.log("Preference::setItem(): user id:",
            user.id, "mode:", mode);
          });
          /////////////////////////////////////////////////////////
        }, (error) => {
          console.log("Preference::getItem(): error while getting user", error);
        });
        // After mode is set call getMode to allow the current user to see
        // the selected mode.
        this.getMode();
      }
    });
    alert.present();
  }

  getMode(){
    this.storage.getItem('user').then((user) => {
      // If this succeeds, then there exists a key value pair that contains:
      // <key: user_id>, <value: user-selected mode>.
      this.storage.getItem(user.id).then((mode) => {
        this.transMode = mode;
        console.log("Preference::getMode(): success!");
        console.log("==> curUser.id:", user.id, "mode:", this.transMode);
      }, (error) => {
          // If getItem() fails, then there are no such entries in the native
          // storage. Let's make one with a default value "Car".
          console.log("Preference::getMode(): no user found in native storage!");
          console.log("==> setting mode to \"car\" and mapping it to user");
          this.storage.setItem(user.id, "Car");
          this.transMode = "Car";
      });
    }, error => {
      console.log("Preference::getMode(): Cannot find user:", error);
    });
  }
}
