import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

// Native storage allows the data to be persistent, meaning that
// the data will exist for as long as the app exists (installed).
//import { NativeStorage } from 'nativestorage';

@IonicPage()
@Component({
  selector: 'page-preference',
  templateUrl: 'preference.html',
})
export class PreferencePage {
  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCrl: AlertController) {

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
      checked: true
    });
    alert.addInput({
      type: 'radio',
      label: 'Walk',
      value: 'Walk',
      checked: true
    });

    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK'
      //handler: data => {
        //this.testRadioOpen = false;
      //  this.testRadioResult = data;
    });

    alert.present();
    /*
    // Adding user peference to local storage
    setPreference(mode){
      // Params: reference_to_value, value, success_callback, error_callback
      NativeStorage.setItem("preference", "car", "set_success", "set_failed");
      console.log("setting preference");
    }

    // Retrieve the preference
    getPreference(){
      // Params: reference_to_value, success_callback, error_callback
      NativeStorage.getItem("preference", "get_success", "get_failed");
      console.log("getting preference");
    }*/
  }
}