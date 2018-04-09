import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { Transportation } from '../../providers/transportation-mode/transportation-mode';
import { NativeStorage } from '@ionic-native/native-storage';
import { UserProvider } from '../../providers/user/user';

@IonicPage()
@Component({
  selector: 'page-preference',
  templateUrl: 'preference.html',
})
export class Preference {
  transMode: any;
  constructor(
    private trans: Transportation,
    private storage: NativeStorage,
    private user: UserProvider) {
      this.getMode();
  }

  getMode(){
    this.user.getUserInfo().then(() => {
      this.storage.getItem(this.user.id).then((user) => {
        this.transMode = user.mode;
        console.log("Preference::getMode(): transMode is:", this.transMode);
      }, (error) => {
        console.log("Preference::getMode(): transMode not set,", error);
      });
    });
  }

  showRadioAlert(){
    this.transMode = this.trans.showRadioAlert(this.transMode)
    console.log("New transmode :", this.transMode);
      // this.getMode();
      // console.log("---->> getmode ran...done:", done);
  }
}
