import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the MapProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class Map {
  apiKey: any = '&key=AIzaSyC_VYR8OeR5oXOwzX--70vdgdFGoAAC8-w';
  distanceUrl: any = 'https://maps.googleapis.com/maps/api/distancematrix/json?';
  origin: any = 'San+Francisco';
  destination: any = 'Seattle';
  originParam: any = 'origins=' + this.origin;
  destParam: any = '&destinations=' + this.destination;

  constructor(public http: HttpClient) {
  }

  getDistance(){
    return new Promise( resolve => {
      this.http.get(this.distanceUrl+this.originParam+this.destParam)
      .subscribe(data => {
        resolve(data);
        console.log("Maps::Success: Distance object is:", data);
      }, (error) => {
        console.log("Maps::Failed: failed to get distance:", error);
      });
    });
  }

}
