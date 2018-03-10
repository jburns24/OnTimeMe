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

  constructor(
    private menu: MenuController,
    private user: UserProvider,
    private googleCalendar: GoogleCalender){
      // After we login and land on the home page, enable the menu for
      // current user
      this.enableMenu();
      // Once we land here call the getUserInfo() method to update
      // user info.
      this.user.getUserInfo();

      this.loadPeople();
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
