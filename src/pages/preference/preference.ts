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
      // Call getMode to get the current selected or default
      // transportation mode each time the preference page is opened.
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
        // Boolean; if user mode != array element then set
        // checked to false, else checked is set to true.
        checked: this.transMode == mode
      });
    })

    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK',
      handler: data => {
        // Get the current user id and mode. Store it into the native storage
        // as a key value pair
        this.storage.setItem(this.user.id, data);

        //////////////// DEBUG: check the value /////////////////
        this.storage.getItem(this.user.id).then( (mode) => {
          console.log("Preference::setItem(): user id:",
            this.user.id, "mode:", mode);
        });
        /////////////////////////////////////////////////////////

        // After mode is set call getMode to allow the current user to see
        // the selected mode.
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
