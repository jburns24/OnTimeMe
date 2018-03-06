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
  user_id: any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public alertCrl: AlertController, public viewCtrl: ViewController,
    public storage: NativeStorage) {
    this.storage.getItem('user').then( (user) => {
      if (this.user_id == user.userId){
        this.storage.getItem(this.user_id).then((user_id) => {
          this.transMode = user_id.data;
          console.log("Preference::getMode(): success!");
        }, (error) => {
          console.log("Preference::getMode(): failure!", error);
        });
      };
  /*    let temp_id = user.userId;
      this.storage.getItem(temp_id).then(
        id => this.transMode = id.data
      );*/
    }, (error) => {
      console.log("Preference dont exist using default car", error);
      this.transMode = "Car";
    });
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
        // Get the user id and map the data to the user id
        this.storage.getItem('user').then( (user) => {
          this.user_id = user.id;
          this.storage.setItem(this.user_id,{
            data: data
          });
          console.log("transMode data is :", data, "user_id :", this.user_id.data);
        }, (error) => {
          console.log("Preference::error while getting item", error);
        });
        // After item is set call getMode to update mode to user
        this.getMode();
      }
    });
    alert.present();
  }
  getMode(){
    this.storage.getItem('user').then((user) => {
      if (this.user_id == user.userId){
        this.storage.getItem(this.user_id).then((user_id) => {
          this.transMode = user_id.data;
          console.log("Preference::getMode(): success!");
        }, (error) => {
          console.log("Preference::getMode(): failure!", error);
        });
      }
      console.log("Retrieve: ", this.transMode);
    }, error => {
      console.log("Cannot retrieve mode", error)
    });
  }
}
