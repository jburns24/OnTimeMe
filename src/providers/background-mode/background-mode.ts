import { BackgroundMode } from '@ionic-native/background-mode';
import { Injectable } from '@angular/core';
// import {Observable} from 'rxjs/Observable';
// import 'rxjs/add/observable/fromPromise';

@Injectable()
export class BackgroundModeProvider{
  constructor(public backgroundMode: BackgroundMode) {
  }

  enableBackgroundMode() : Promise<boolean>{
    return new Promise(resolve => {
      this.backgroundMode.enable();
      resolve(this.waitForEnable());
    });
  }

  waitForEnable() : Promise<boolean> {
    return new Promise(resolve => {
      this.backgroundMode.on('enable').subscribe(() => {
        resolve(true);
      });
    });
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

  disableBackgroundMode() : Promise<any>{
    return new Promise(resolve => {
      this.backgroundMode.disable();
      this.backgroundMode.on('disable').subscribe(() => {
        console.log("BackgroundModeProvider::disableBackgroundMode(): success");
        resolve(true);
      });
    });
  }

  setBackgroundDefaults(){
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
  }
}
