import { Component } from '@angular/core';
import { MenuController } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user';
import { GoogleCalendar} from '../../providers/google-calendar/google-calendar';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  //providers: [GoogleCalender]
})

export class HomePage {
  people: any;
  events: any;
  refreshTokenId: any;
  authToken: any;

  constructor(
    private menu: MenuController,
    private user: UserProvider,
    private googleCalendar: GoogleCalendar){
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
        this.googleCalendar.init(this.user.serverAuthCode).then(() => {
          console.log("HOME::CONSTRUCTOR: checking the refresh token:",
          this.googleCalendar.refreshToken);
          this.getList(this.googleCalendar.refreshToken);
        });
      });
        // this.getRefreshTokenId(this.user.serverAuthCode);
        // this.getRefreshToken(this.refreshTokenId);
      //});
      // this.getList(this.authToken);
  }

  // getRefreshTokenId(serverAuthCode: any){
  //   console.log("GET REFRESH TOKEN ID IS CALLLEEEDD!!!!!!!!!!!!!!!");
  //   this.googleCalendar.getRefreshTokenId(serverAuthCode).then( (refreshTokenId) => {
  //     this.refreshTokenId = refreshTokenId;
  //     console.log("Home::getRT(): success at getting RT_id", this.refreshTokenId);
  //   }, (error) => {
  //     console.log("Home::getRT(): error:", error);
  //   });
  // }
  //
  // getRefreshToken(refreshTokenId: any){
  //   console.log("GET REFRESH TOKEN IS CALLLEEEDD!!!!!!!!!!!!!!!");
  //   this.googleCalendar.getRefreshToken(refreshTokenId).then( (refreshToken) => {
  //     this.authToken = refreshToken;
  //     console.log("Home::getRT(): success at getting RT", this.authToken);
  //   }, (error) => {
  //     console.log("Home::getRT(): error:", error);
  //   });
  // }

  getList(authToken: any){
    console.log("HOME::GET LIST IS CALLLEEEDD!!!!!!!!!!!!!!!");
    this.googleCalendar.getList(authToken).then( (list) => {
      this.events = list;
      console.log("Home::getList(): Successfully implemented calendar api", this.events);
    }, (error) => {
      console.log("Home::getList(): error:", error);
    });
  }

  enableMenu(){
    this.menu.enable(true);
  }
}
