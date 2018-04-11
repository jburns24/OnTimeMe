import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage';

@Injectable()
export class GoogleCalendar {
  data: any;
  events: any;
  calendarUrl: any = 'https://www.googleapis.com/calendar/v3';
  eventList: any = '/calendars/primary/events';

  // Testing refresh token
  code: any;
  authUrl: any = 'https://www.googleapis.com/oauth2/v4/token';
  secret: any = 'QqOIOYrrK3eyLpZwkFvwZ6x9';
  redirectUri: any = 'http://localhost:8080';
  clientId: any = '311811472759-j2p0u79sv24d7dgmr1er559cif0m7k1j.apps.googleusercontent.com';
  refreshToken: any;

  constructor(public http: HttpClient,
    private storage: NativeStorage) {
    }

  init(serverAuthCode: any){
    return this.storage.getItem('refreshToken').then ((RT) => {
      this.refreshToken = RT.token;
    }, (error) => {
      console.log("Google-calendar::init: refreshToken not set:", error);
      return new Promise(resolve => {
        resolve(this.getRefreshTokenId(serverAuthCode));
      });
    });
  }

  getRefreshTokenId(serverAuthCode: any){
    return new Promise(resolve => {
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded'
        })
      };

      const params = {
        'code': serverAuthCode,
        'client_id': this.clientId,
        'client_secret': this.secret,
        'redirect_uri': this.redirectUri,
        'grant_type': 'authorization_code'
      }
      this.http.post(this.authUrl, httpOptions, { params }).subscribe((data) => {
        resolve(this.getRefreshToken(data['refresh_token']));
      }, (error) => {
        console.log("Google-calendar::getRefreshTokenId(): failed!", error);
      });
    });
  }

  getRefreshToken(refreshTokenId: any){
    return new Promise(resolve => {
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded'
        })
      };

      const params = {
        'refresh_token': refreshTokenId,
        'client_id': this.clientId,
        'client_secret': this.secret,
        'grant_type': 'refresh_token'
      }
      this.http.post(this.authUrl, httpOptions, { params }).subscribe((data) => {
        this.refreshToken = data['access_token'];
        this.storage.setItem('refreshToken', { token: this.refreshToken });
        resolve(this.refreshToken);
      }, (error) => {
        console.log("Google-calendar::getRefreshToken(): failed!", error);
      });
    });
  }

  //  Takes a user authToken executes a google Event List api call and returns the response
  getList(authToken: string) : Promise<any>{
    //  This was taken from the angular 2 documenation on how to set HttpHeaders
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + authToken
      })
    };

    // Gets RFC3339 formatted date strings to pass to calendar api to limit results to today.
    let today = new Date(Date.now()).toISOString();
    let tomorrow = new Date(Date.now() + 86400000).toISOString();
    let urlParams = '?timeMax='+ tomorrow + '&timeMin=' + today + '&orderBy=startTime&singleEvents=true';

    if (this.events) {
      // if events already exists, promise will resolve and promise can
      // be call from outside function to obtain data.
      return Promise.resolve(this.data);
    }

    // Don't have data yet
    return new Promise(resolve => {
      this.http.get(this.calendarUrl + this.eventList + urlParams, httpOptions).subscribe(data => {
        resolve(data);
      }, (error) => {
        console.log("Google-calendar::cannot get list:", error);
      });
    });
  }

  // lastKnown(){
  //   return new Promise(resolve => {
  //     // 1. Create an alert telling the users they need internet connection
  //     // for such request.
  //     // 2. If events exist then store the last known location, time-estimates
  //     // from there, mode of transportation, and last update.
  //     this.user.getUserInfo().then((user) => {
  //       console.log("1. Google-calendar::lastKnown(): success");
  //       this.storage.getItem(user.id).then((curUser) => {
  //         console.log("2. Google-calendar::lastKnown(): success got mode");
  //         this.storage.getItem('updated').then((update) => {
  //           console.log("3. Google-calendar::lastKnown(): success got update");
  //           this.storage.setItem('lastKnown', {mode: curUser.mode, time: update.time}).then(() =>{
  //             console.log("Google-calendar::lastKnown(): successfully stored last_known:");
  //             this.storage.getItem('lastKnown').then((lastKnown) =>{
  //               console.log("Google-calendar::lastKnown(): get last known is:", lastKnown);
  //               resolve(1);
  //             });
  //           }, (error) => {
  //             console.log("Google-calendar::lastKnown(): failed to store last known,", error);
  //           });
  //         }, (error3) => {
  //           console.log("3. Google-calendar::lastKnown(): failed to get update,", error3);
  //         });
  //       }, (error2) => {
  //         console.log("2. Google-calendar::lastKnown(): failed to get mode,", error2);
  //       });
  //     }, (error1) => {
  //       console.log("1, Google-calendar::lastKnown(): failed to get user info,", error1);
  //     });
  //   });
  // }
}
