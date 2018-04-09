import { Component } from '@angular/core';
import { MenuController } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user';
import { GoogleCalendar} from '../../providers/google-calendar/google-calendar';
import { NativeStorage } from '@ionic-native/native-storage';
import { RealTimeClockProvider } from '../../providers/real-time-clock/real-time-clock'
import { LocationTracker } from '../../providers/location-tracker/location-tracker'
import { Events } from '../../providers/events/events';
import { Transportation } from '../../providers/transportation-mode/transportation-mode';

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
  epochNow: any;

  constructor(
    private realTimeClock: RealTimeClockProvider,
    private menu: MenuController,
    private user: UserProvider,
    private googleCalendar: GoogleCalendar,
    private event: Events,
    public locationTracker: LocationTracker,
    private trans: Transportation,
    private storage: NativeStorage){
      this.enableMenu();
      this.checkMode();
      //this.start();
  }

  checkMode(){
    this.user.getUserInfo().then(() => {
      this.storage.getItem(this.user.id).then((user) => {
        console.log("Home::checkMode(): mode already set:", user.mode);
      }, (error) => {
        console.log("Home::checkMode(): mode not set yet:", error);
        this.trans.showRadioAlert();
      });
    });
  }

  start(){
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
  }
}
