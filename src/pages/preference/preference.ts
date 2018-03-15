import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';
import { UserProvider } from '../../providers/user/user';


@IonicPage()
@Component({
  selector: 'page-preference',
  templateUrl: 'preference.html',
})
export class PreferencePage {
  transMode: any;

  constructor(
    private alertCrl: AlertController,
    private storage: NativeStorage,
    private user: UserProvider) {
      this.getMode();
  }

  showRadioAlert(){
    let alert = this.alertCrl.create();
    alert.setTitle('Select Transportation Mode');
    // Add new transportation mode here
    const modeArray = ['Car', 'Bike', 'Walk'];
    // Iterate thru modeArray and create inputs for each element
    modeArray.forEach( mode => {
      alert.addInput({
        type: 'radio',
        label: mode,
        value: mode,
        checked: this.transMode == mode
      });
    })

    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK',
      handler: data => {
        this.storage.setItem(this.user.id, data);
        this.getMode();
      }
    });
    alert.present();
  }

  getMode(){
    // If this succeeds, then there exists a key value pair that contains:
    // <key: user_id>, <value: user-selected mode>.
    this.storage.getItem(this.user.id).then((mode) => {
      this.transMode = mode;
      console.log("Preference::getMode(): success!");
      console.log("==> curUser.id:", this.user.id, "mode:", this.transMode);
    }, (error) => {
        // If getItem() fails, then there are no such entries in the native
        // storage. Let's make one with a default value "Car".
        console.log("Preference::getMode(): no user found in native storage!");
        console.log("==> setting mode to \"car\" and mapping it to user");
        this.storage.setItem(this.user.id, "Car");
        this.transMode = "Car";
    });
  }
}
