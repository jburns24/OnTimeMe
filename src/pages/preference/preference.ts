import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AlertController, ViewController } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';

// Native storage allows the data to be persistent, meaning that
// the data will exist for as long as the app exists (installed).
//import { NativeStorage } from 'nativestorage';

@IonicPage()
@Component({
  selector: 'page-preference',
  templateUrl: 'preference.html',
})
export class PreferencePage {
  transMode: any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public alertCrl: AlertController, public viewCtrl: ViewController,
    public storage: NativeStorage) {
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
        this.storage.setItem('transMode', data);
        console.log("data is :", data);
        
        this.storage.getItem('transMode').then((data) => {
          this.transMode = data;
          console.log("Retrieve: ", this.transMode);
        }, error => {
          console.log("Cannot retrieve mode", error)
        });      }
    });
    alert.present();


  }
}
