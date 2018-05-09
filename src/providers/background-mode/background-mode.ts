import { BackgroundMode } from '@ionic-native/background-mode';
import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';

/*
  Generated class for the BackgroundModeProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class BackgroundModeProvider{
  constructor(public backgroundMode: BackgroundMode) {
  }

  enableBackgroundMode() : Promise<boolean>{
    return new Promise(resolve => {
      //this.backgroundMode.on('deviceready').subscribe(() => {
        this.backgroundMode.enable();
        resolve(this.waitForEnable());
      //});
    });
  }

  waitForEnable() : Promise<boolean> {
    return new Promise(resolve => {
      this.backgroundMode.on('enable').subscribe(() => {
        // this.backgroundMode.overrideBackButton();
        // this.backgroundMode.on('activate').subscribe(() =>{
        //   this.backgroundMode.setDefaults();
        //   this.backgroundMode.disableWebViewOptimizations();
        //   this.backgroundMode.moveToBackground();
          resolve(true);
        // });
        // this.setBackgroundDefaults();
        // this.backgroundMode.disableWebViewOptimizations();
        // resolve(this.waitForIt());
      });
    });
  }

  // checkIfEnabled(){
  //
  // }

  overrideBackButton(){
    this.backgroundMode.overrideBackButton();
  }

  disableWebViewOptimizations(){
    return new Promise(resolve => {
      this.backgroundMode.disableWebViewOptimizations();
      resolve();
    });
  }

  moveToBackground(){
    this.backgroundMode.moveToBackground();
  }

  setBackgroundDefaults(){
    //return new Promise(resolve => {
      // resolve(this.backgroundMode.isEnabled());
      // if (this.backgroundMode.isEnabled()){
        // console.log("APP.COMPONENT::initializeApp(): background mode is enabled.");
        // // Overide the back button to go to background instead of closing the app
        // this.backgroundMode.overrideBackButton();

        // Set the Default values for the background notification mode.
        this.backgroundMode.setDefaults({
          title: 'OnTimeMe is running in the background.',
          text: 'We are helping you be on time.',
          icon: 'icon',
          color: 'F14F4D', // hex format
          resume: true,
          hidden: false,
          bigText: true,
          // To run in background without notification
          silent: false
      });

      // Might need this later:
      // Various APIs like playing media or tracking GPS position in background
      // might not work while in background even the background mode is active.
      // To fix such issues the plugin provides a method to disable most
      // optimizations done by Android/CrossWalk.
      // this.backgroundMode.on('activate', function() {
      //   this.backgroundMode.disableWebViewOptimizations();
      // });
    //     resolve(true);
    //   } else{
    //     console.log("APP.COMPONENT::initializeApp(): background mode is not enabled.");
    //     resolve(false);
    //   };
    // });
  }

}
