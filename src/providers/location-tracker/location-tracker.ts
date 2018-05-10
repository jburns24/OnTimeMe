import { Injectable, NgZone } from '@angular/core';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { BackgroundModeProvider } from '../background-mode/background-mode';
import { AlertController } from 'ionic-angular';
import 'rxjs/add/operator/filter';

// Source: https://www.joshmorony.com/adding-background-geolocation-to-an-ionic-2-application/

@Injectable()
export class LocationTracker {

  public watch: any;
  public lat: number = 0;
  public lng: number = 0;

  constructor(public zone: NgZone,
    public backgroundGeolocation: BackgroundGeolocation,
    public geolocation: Geolocation,
    private alertCrl: AlertController,
    private backgroundMode: BackgroundModeProvider) {

  }

  startTracking() {
    return new Promise (resolve => {
        // Background Tracking

        let config = {
          //locationProvider: BackgroundGeolocation.DISTANCE_FILTER_PROVIDER,
          desiredAccuracy: 0,
          notificationTitle: 'OnTimMe Background Tracking',
          notificationText: 'Keeping you on time',
          stationaryRadius: 20,
          distanceFilter: 10,
          debug: false, // means app uses local notifications to notify when backgrounded location updates happen.
          interval: 10000,
          stopOnTerminate: true
        };

        this.backgroundGeolocation.configure(config).subscribe((location) => {

          //console.log('BackgroundGeolocation:  ' + location.latitude + ',' + location.longitude);

          // Run update inside of Angular's zone
          this.zone.run(() => {
            this.lat = location.latitude;
            this.lng = location.longitude;
          });

        }, (err) => {

          console.log(err);

        });

        // Turn ON the background-geolocation system.
        this.backgroundGeolocation.start();


        // Foreground Tracking

      let options = {
        frequency: 3000,
        enableHighAccuracy: false
      };
      //  subscribing to the observable returned by watchPosition, then filtering the response to ignore errors, then casting to type Geoposition
      //  The casting is needed so TypeScript doesnt yell at us.
      this.watch = this.geolocation.watchPosition(options).filter((p: any) => p.code === undefined).subscribe((position: Geoposition) => {

        //console.log(position);

        // Run update inside of Angular's zone
        this.zone.run(() => {
          this.lat = position.coords.latitude;
          this.lng = position.coords.longitude;
        });

      });
      resolve();
    });
  }

  stopTracking() {
    console.log('stopTracking');

    return this.backgroundGeolocation.stop().then(() => {
      if (typeof this.watch !== 'undefined') {
        this.watch.unsubscribe();
      }
    });
  }

  isLocationEnabled(){
    return new Promise(resolve => {
      this.backgroundGeolocation.isLocationEnabled().then((status) => {
        console.log("LocationTracker::isLocationEnabled(): ", status);
        resolve(status);
      });
    });
  }

  enableLocationServices(){
    return new Promise(resolve => {
      let alert = this.alertCrl.create();
      alert.setTitle('App requires location service to be turned on.');
      alert.addButton({
        text: 'OK',
        handler: data => {
          if(this.backgroundMode.backgroundMode.isEnabled()){
            this.backgroundMode.disableBackgroundMode().then((retVal) => {
              if(retVal){
                this.backgroundGeolocation.showLocationSettings();
                resolve(true);
              } else {
                console.log("LocationTracker::enableLocationServices(): cannot disable backgroundMode");
                resolve(false);
              }
            });
          } else{
            this.backgroundGeolocation.showLocationSettings();
            resolve(true);
          };
        }
      });
      alert.present();
    });
  }

}
