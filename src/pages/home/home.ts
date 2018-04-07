import { Component } from '@angular/core';
import { MenuController } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user';
import { GoogleCalendar} from '../../providers/google-calendar/google-calendar';

import { RealTimeClockProvider } from '../../providers/real-time-clock/real-time-clock'
import { LocationTracker } from '../../providers/location-tracker/location-tracker'
import { Events } from '../../providers/events/events';
import { Map } from '../../providers/map/map';
import { Observable } from 'rxjs/Observable';



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
  location: any;
  // observables: Array<Observable<number>> = [];
  // eventsSize: any;
  // observers: any[];
  // time: Array<number> = [];
  // subscription: any;
  epochNow: any;

  constructor(
    private realTimeClock: RealTimeClockProvider,
    private menu: MenuController,
    private user: UserProvider,
    private googleCalendar: GoogleCalendar,
    private event: Events,
    public locationTracker: LocationTracker,
    private map: Map){
      this.enableMenu();
      this.locationTracker.startTracking().then(() => {
        this.user.getUserInfo().then(() => {
          this.googleCalendar.init(this.user.serverAuthCode).then(() => {
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
      //this.epochNow = this.realTimeClock.getEpochTime().do(() => ++this.todaysEpoch);
      //this.epochNow.subscribe((t) => this.epochNow = t);
  }

  getList(authToken: any){
    return new Promise (resolve => {
      this.googleCalendar.getList(authToken).then( (list) => {
        this.events = list;
        this.event.storeTodaysEvents(JSON.stringify(this.events)).then(() => {
          console.log('home::getList() successfully saved todays events');
          this.event.getTodaysEvents().then((events) =>{
            this.eventList = events;
            this.epochNow = this.realTimeClock.getEpochTime().do(() => ++this.todaysEpoch);
            this.epochNow = this.epochNow.share();
            // this.eventsSize = this.eventList.length;
            // this.observers = new Array(this.eventsSize);
            // //let counter = 0;
            // for (let i = 0; i < this.eventsSize; i++){
            //   this.observables[i] = this.realTimeClock.getEpochTime().do(() => ++this.todaysEpoch);
            //   this.observables[i].share();
            //   this.subscription = this.observables[i].subscribe(
            //     value => this.time[i] = value
            //   );
            //   //this.observables[i] = this.epochNow;
            //   //for(let i = 0; i < this.eventsSize; i++){
            //     //this.epochNow.subscribe(this.observers[i]);
            //     console.log("This time : ", this.time[i]);
            //     console.log("supscription : ", this.subscription);
            //     console.log("event is :", this.eventsSize);
            //     console.log("Observers:", this.observables[i]);
                //counter += 1;
              //};
            //};

            console.log('successfully got user events ', this.eventList);
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
