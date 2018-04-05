import { Component } from '@angular/core';
import { MenuController } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user';
import { GoogleCalendar} from '../../providers/google-calendar/google-calendar';
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
  TodayEPOC: number;
  location: any;


  constructor(
    private menu: MenuController,
    private user: UserProvider,
    private googleCalendar: GoogleCalendar,
    private event: Events,
    private map: Map){
      this.enableMenu();
      this.user.getUserInfo().then(() => {
        this.googleCalendar.init(this.user.serverAuthCode).then(() => {
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
          this.TodayEPOC = Date.now() / 1000;
          this.location = events[0].location;
          this.map.getPreferenceMode().then((mode) => {
            this.map.getCurrentPosition().then((position) => {
              let origin = position;
              console.log('Home::getList: origin is:', origin);
              this.map.getDistance(this.location, mode, origin).then ( (suc) => {
                console.log('Home::getList(): successfully got distance:', suc);
              }, (error) => {
                console.log('Home::getList(): failed to get distance:', error);
              });
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
  }

  enableMenu(){
    this.menu.enable(true);
  }
}
