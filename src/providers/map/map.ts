import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the MapProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class Map {
  constructor(public http: HttpClient) {
  }

  getDistance(destinationParam: string){
    return new Promise( resolve => {
      // Convert the location string to strings that maps api will take
      let takeAwaySpace = destinationParam;
      let takeAwayComma = takeAwaySpace.split(' ').join('+');
      let destination = takeAwayComma.split(',').join('');
      // NOTE: DELETE THIS WHEN DONE
      console.log("Maps::getDistance(): checking destination string:", destination);
      /////////////////////////
      let distanceUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json?';
      let origin = 'San+Francisco';
      let originParam = 'origins=' + origin;
      let destParam = '&destinations=' + destination;
      let mode = 'bicycling';
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
}
