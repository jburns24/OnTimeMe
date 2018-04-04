import { Component } from '@angular/core';
import { MenuController } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user';
import { GoogleCalendar} from '../../providers/google-calendar/google-calendar';
import { Events } from '../../providers/events/events'
import { RealTimeClockProvider } from '../../providers/real-time-clock/real-time-clock'
import { LocationTracker } from '../../providers/location-tracker/location-tracker'

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
  epochNow;
  

  constructor(
    private realTimeClock: RealTimeClockProvider,
    private menu: MenuController,
    private user: UserProvider,
    private googleCalendar: GoogleCalendar,
    private event: Events,
    private locationTracker: LocationTracker){
      // After we login and land on the home page, enable the menu for
      // current user
      this.enableMenu();
      this.locationTracker.startTracking();
      // Once we land here call the getUserInfo() method to update
      // user info.

      // because localStorage.getItem() returns a promis that must
      // propigate up to all dependent methods. getUserInfo() was not
      // returning a promise so that meant that there was a possibility
      // for a race condition when accessng the authToken.
      this.user.getUserInfo().then(() => {
        this.googleCalendar.init(this.user.serverAuthCode).then(() => {
          // console.log("HOME::CONSTRUCTOR: checking the refresh token:",
          // this.googleCalendar.refreshToken);
          this.getList(this.googleCalendar.refreshToken);
        });
      });
  }

  getList(authToken: any){
    return this.googleCalendar.getList(authToken).then( (list) => {
      this.events = list;
      this.event.storeTodaysEvents(JSON.stringify(this.events)).then(() => {
        console.log('home::getList() successfully saved todays events');
        this.event.getTodaysEvents().then((events) =>{
          this.eventList = events;
          this.epochNow = this.realTimeClock.getEpochTime().do(() => ++this.todaysEpoch);      
          console.log('successfully got user events ', events);
        }, (err) => {
          console.log('home::getList() failed to get saved events', err);
        });
      }, (err) => {
        console.log('home::getList() failed to save events ', err);
      });
    }, (error) => {
      console.log("Home::getList(): error:", error);
    });
  }

  enableMenu(){
    this.menu.enable(true);
  }
}
