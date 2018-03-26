import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserProvider } from '../user/user';
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
    private storage: NativeStorage,
    private user: UserProvider) {
      this.storage.getItem('refreshToken').then ((RT) => {
        this.refreshToken = RT.token;
      }, (error) => {
        console.log("Google-calendar::Constructor: refreshToken not set:", error);
      });
    }

  // Dummy method: does nothing helps re-initalize this provider for when
  // users exit without logging out. 
  dummy(){}

  init(serverAuthCode: any){
    // If we already have refresh token, resolve the promise
    if (this.refreshToken){
      return Promise.resolve(this.refreshToken);
    }
    // Else, must be a fresh login...
    return new Promise(resolve => {
      //console.log("GOOGLE-CALENDAR::init(): Checking the this.refreshToken: ", this.refreshToken);
      resolve(this.getRefreshTokenId(serverAuthCode));
    });
  }

  getRefreshToken(refreshTokenId: any){
    return new Promise(resolve => {
      console.log("Google-calendar::getRT(): The refreshTokenId is:", refreshTokenId);
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
        this.user.getUserInfo().then(() => {
          this.storage.setItem('refreshToken', { token: this.refreshToken }).then(() => {
            this.storage.getItem('refreshToken').then((user) => {
              let RT = user.token;
              console.log("Google-calendar:: successfully stored RT", RT);
            });
          });
        });
        resolve(this.refreshToken);
        console.log("Google-calendar::getRefreshToken(): SUCCESS!!! Refresh token is:",
        this.refreshToken);
        console.log("Google-calendar::getRefreshToken(): refresh token metadata:", data);
      }, (error) => {
        console.log("Google-calendar::getRefreshToken(): failed!", error);
      });
    });
  }

  getRefreshTokenId(serverAuthCode: any){
    console.log("Google-calendar::getRTID(): serverAuthCode is:", serverAuthCode);
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
        console.log("Google-calendar::getRefreshTokenId(): magically worked!");
          resolve(this.getRefreshToken(data['refresh_token']));
        console.log("Google-calendar::getRefreshTokenId(): id:", data);
      }, (error) => {
        console.log("Google-calendar::getRefreshTokenId(): failed!", error);
      });
    });
  }

  //  Takes a user authToken executes a google Event List api call and returns the response
  getList(authToken: string){
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
        // this.data = data['items'];
        // console.log("Google-calendar::getList(): summary is:", this.data);
        // console.log("Google-calendar::getList(): list is:", data);
        resolve(data);
      }, (error) => {
        console.log(error);
      });
    });
  }
}
