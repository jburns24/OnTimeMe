import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';
import { UserProvider } from '../../providers/user/user';

@Injectable()
export class Transportation {
  mode: any;
  constructor(
    private alertCrl: AlertController,
    private storage: NativeStorage,
    private user: UserProvider) {
  }

  showRadioAlert(transMode?: any): Promise<any> {
    return new Promise(resolve => {
      let alert = this.alertCrl.create();
      alert.setTitle('Select Your Mode of Transportation');
      const modeArray = ['driving', 'bicycling', 'walking'];
      // Iterate thru modeArray and create inputs for each element
      modeArray.forEach( mode => {
        alert.addInput({
          type: 'radio',
          label: mode,
          value: mode,
          checked: transMode == mode,
        });
      })

      alert.addButton('Cancel');
      alert.addButton({
        text: 'OK',
        handler: data => {
          this.user.getUserInfo().then((user) => {
            this.storage.setItem(user.id, { mode: data }).then(() => {
              console.log("Transportation::showRadioAlert(): successfully set mode");
              console.log("==> user.id:", user.id, "mode:", data);
              this.storage.getItem(user.id).then((data) => {
                this.mode = data.mode;
                resolve(this.mode);
              });
            }, (error) => {
              console.log("Transporation::showRadioAlert(): failed to set item,", error);
            });
          });
        }
      });
      alert.present();
    });
  }
}
