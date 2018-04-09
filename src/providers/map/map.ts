import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage';
import { UserProvider } from '../user/user';
import { Geolocation } from '@ionic-native/geolocation';

@Injectable()
export class Map {
  mode: any;
  constructor(public http: HttpClient,
    private storage: NativeStorage,
    private user: UserProvider,
    private geolocation: Geolocation) {
  }

  getDistance(destinationParam: string, mode: any, origin: any){
    return new Promise( resolve => {
      // Convert the location string to strings that maps api will take
      let takeAwaySpace = destinationParam;
      let takeAwayComma = takeAwaySpace.split(' ').join('+');
      let destination = takeAwayComma.split(',').join('');
      let distanceUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json?';
      let originParam = 'origins=' + origin;
      let destParam = '&destinations=' + destination;
      console.log("THIS MODE :", mode);
      let modeParam = '&mode=' + mode;
      let apiKey = '&key=AIzaSyC_VYR8OeR5oXOwzX--70vdgdFGoAAC8-w';

      // Make the map api call
      this.http.get(distanceUrl+originParam+destParam+modeParam+apiKey)
      .subscribe(data => {
        resolve(data);
        console.log("Maps::Success: Distance object is:", data);
      }, (error) => {
        resolve(error);
        console.log("Maps::Failed: failed to get distance:", error);
      });
    });
  }

  // This calls user provider then in turn
  // calls native storage to get the user preference mode.
  getPreferenceMode(){
    return new Promise(resolve => {
      this.user.getUserInfo().then((user) => {
        this.storage.getItem(user.id).then((userId) => {
          console.log("Map::getMode(): success!");
          console.log("==> curUser.id:", user.id, "mode:", userId.mode);
          this.mode = userId.mode;
          resolve(this.mode);
        }, (error) => {
            console.log("Map::getMode(): no user found in native storage!", error);
            resolve(this.mode);
        });
      });
    });
  }

  // Gets the current position of device, not really accurate.
  getCurrentPosition(): Promise<any> {
    return new Promise(resolve => {
      let options = {enableHighAccuracy: true, timeout: 10000};
      this.geolocation.getCurrentPosition(options).then((resp) => {
        let lat = resp.coords.latitude;
        let long = resp.coords.longitude;
        let latLong = lat+","+long;
        resolve(latLong);
        console.log('Maps::getCurrentPosition(): Success lat/long:', latLong);
      }, (error) => {
        console.log('Maps::getCurrentPosition(): error getting location:', error);
      });
    });
  }
}
