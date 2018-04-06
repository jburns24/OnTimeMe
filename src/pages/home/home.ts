import { Component } from '@angular/core';
import { MenuController } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user';
import { GoogleCalendar} from '../../providers/google-calendar/google-calendar';

import { RealTimeClockProvider } from '../../providers/real-time-clock/real-time-clock'
import { LocationTracker } from '../../providers/location-tracker/location-tracker'
import { Events } from '../../providers/events/events';
import { Map } from '../../providers/map/map';



@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})

export class HomePage {
  people: any;
  events: any;
  refreshTokenId: any;
  authToken: any;
  eventList: any;
  todaysEpoch = Date.now();
  location:any;
  epochNow;
  

  constructor(
    private realTimeClock: RealTimeClockProvider,
    private menu: MenuController,
    private user: UserProvider,
    private googleCalendar: GoogleCalendar,
    private event: Events,
    public locationTracker: LocationTracker,
      // After we login and land on the home page, enable the menu for
      // current user
    private map: Map){
      this.enableMenu();
      this.locationTracker.startTracking().then(() => {
        this.user.getUserInfo().then(() => {
          this.googleCalendar.init(this.user.serverAuthCode).then(() => {
            // console.log("HOME::CONSTRUCTOR: checking the refresh token:",
            // this.googleCalendar.refreshToken);
            this.getList(this.googleCalendar.refreshToken).then(() => {
            }, (err) => {
              console.log("home::getList() error", err);
            });
          }, (err) => {
            console.log("gogoleClaendar init() error", err);
          });
        }, (err) => {
          console.log("GetUserInfor error", err);
        });
      });

  }
// lat+","+long
  getList(authToken: any){
    return new Promise (resolve => {
      this.googleCalendar.getList(authToken).then( (list) => {
        this.events = list;
        this.event.storeTodaysEvents(JSON.stringify(this.events)).then(() => {
          console.log('home::getList() successfully saved todays events');
          this.event.getTodaysEvents().then((events) =>{
            this.eventList = events;
            this.epochNow = this.realTimeClock.getEpochTime().do(() => ++this.todaysEpoch);   
            console.log('successfully got user events ', events);
            this.location = events[0].location;
            this.map.getPreferenceMode().then((mode) => {
              let origin = this.locationTracker.lat + ',' + this.locationTracker.lng;
              this.map.getDistance(this.location, mode, origin).then ( (suc) => {
                console.log('Home::getList(): successfully got distance:', suc);
              }, (error) => {
                console.log('Home::getList(): failed to get distance:', error);
              });
            });
            console.log('Home::getList(): successfully got user events ', events);
          }, (err) => {
            console.log('Home::getList(): failed to get saved events', err);
          });
        }, (err) => {
          console.log('Home::getList(): failed to save events ', err);
        });
      }, (error) => {
        console.log("Home::getList(): error:", error);
      });
      resolve(this.event);
    });
  }

  enableMenu(){
    this.menu.enable(true);
  }

  doRefresh(refresher){
    this.getList(this.googleCalendar.refreshToken).then(() => {
      refresher.complete();
    }, (err) => {
      console.log("home::getList() error", err);
    });
};
}
