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

  showRadioAlert(transMode?: any) : any {
    let alert = this.alertCrl.create();
    alert.setTitle('Select Transportation Mode');
    // Add new transportation mode here
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
        this.user.getUserInfo().then(() => {
          this.storage.setItem(this.user.id, { mode: data }).then(() => {
            console.log("Transportation::showRadioAlert(): successfully set mode");
            console.log("==> user.id:", this.user.id, "mode:", data);
            this.storage.getItem(this.user.id).then((user) => {
              this.mode = data.mode;
            });
          }, (error) => {
            console.log("Transporation::showRadioAlert(): failed to set item,", error);
          });
        });
      }
    });
    alert.present();
    return this.mode;
  }
}
