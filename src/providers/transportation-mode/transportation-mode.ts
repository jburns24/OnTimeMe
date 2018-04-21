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

  showRadioAlert(transMode?: any, titleParam?: any): Promise<any> {
    return new Promise(resolve => {
      let alert = this.alertCrl.create();
      let title = titleParam;
      alert.setTitle(title);
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
      if (transMode != null){
        alert.addButton('Cancel');
      };
      alert.addButton({
        text: 'OK',
        handler: data => {
          if (data != null){
            this.user.getUserInfo().then((user) => {
              this.storage.setItem(user.id, { mode: data }).then(() => {
                // this.storage.getItem(user.id).then((user) => {
                //   this.mode = user.mode;
                  resolve(true);
                //});
              }, (error) => {
                console.log("Transporation::showRadioAlert(): failed to set item,", error);
              });
            });
          } else {
            let title = "You have to select a default mode of transportation!"
            resolve(this.showRadioAlert(null, title));
          };
        }
      });
      alert.present();
    });
  }

  getNewMode(eventParam:any){
    return new Promise(resolve => {
      let alert = this.alertCrl.create();
      let title = 'Set new mode for ' + eventParam.summary + '?';
      alert.setTitle(title);
      const modeArray = ['driving', 'bicycling', 'walking'];
      // Iterate thru modeArray and create inputs for each element
      modeArray.forEach( mode => {
        alert.addInput({
          type: 'radio',
          label: mode,
          value: mode,
          checked: eventParam.mode == mode,
        });
      })
      alert.addButton('Cancel');
      alert.addButton({
        text: 'OK',
        handler: data => {
          resolve(data);
        }
      });
      alert.present();
    });
  }
}
