import { Component } from '@angular/core';
import { MenuController } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user';
import { GoogleCalender} from '../../providers/google-calender/google-calender';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  //providers: [GoogleCalender]
})

export class HomePage {
  people: any;
  events: any;

  constructor(
    private menu: MenuController,
    private user: UserProvider,
    private googleCalendar: GoogleCalender){
      // After we login and land on the home page, enable the menu for
      // current user
      this.enableMenu();
      // Once we land here call the getUserInfo() method to update
      // user info.

      // because localStorage.getItem() returns a promis that must
      // propigate up to all dependent methods. getUserInfo() was not
      // returning a promise so that meant that there was a possibility
      // for a race condition when accessng the authToken.
      this.user.getUserInfo().then(() => {
        this.getList(this.user.authToken);
      });

      this.loadPeople();

      // Calendar testing
      //this.getList(this.user.authToken);
  }

  getList(authToken: string){
    console.log("GET LIST IS CALLLEEEDD!!!!!!!!!!!!!!!");
    this.googleCalendar.getList(authToken).then( (list) => {
      this.events = list;
      console.log("Home::getList(): Successfully implemented calendar api", this.events);
    }, (error) => {
      console.log("Home::getList(): error:", error);
    });
  }

  loadPeople(){
    this.googleCalendar.load().then( (data) => {
      this.people = data;
      console.log("Home::Successfully implemented the api", this.people);
    }, (error) => {
      console.log("Home::loadPeople(): error:", error);
    });
  }

  enableMenu(){
    this.menu.enable(true);
  }
}
