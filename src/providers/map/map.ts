/**
 * Quick notes:
 *  We need to think about how we would like to store the data. Looks like
 *  we have some weaving to do. What about the other attributes for this object.
 *
 *  Thoughts: should we cache it and use just what's needed? What if the
 *            list is long? Or should we keep it in native storage? How
 *            are we managing native storage? Seems like it's growing...
 *            and continues to grow bigger.
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage';
import { UserProvider } from '../user/user';


@Injectable()
export class Map {
  constructor(public http: HttpClient,
    private storage: NativeStorage,
    private user: UserProvider) {
  }

  getDistance(destinationParam: string, mode: any){
    return new Promise( resolve => {
      // Convert the location string to strings that maps api will take
      let takeAwaySpace = destinationParam;
      let takeAwayComma = takeAwaySpace.split(' ').join('+');
      let destination = takeAwayComma.split(',').join('');
      let distanceUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json?';
      let origin = 'San+Francisco';
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
        this.storage.getItem(this.user.id).then((userId) => {
          console.log("Map::getMode(): success!");
          console.log("==> curUser.id:", this.user.id, "mode:", userId.mode);
          resolve(userId.mode);
        }, (error) => {
            console.log("Map::getMode(): no user found in native storage!", error);
        });
      });
    });
  }
}
