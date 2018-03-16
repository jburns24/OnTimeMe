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
  //serverAuthCode: any;

  constructor(public http: HttpClient,
    private storage: NativeStorage,
    private user: UserProvider) {

    }

  init(serverAuthCode: any){
    this.getRefreshTokenId(serverAuthCode);
  }

  getRefreshToken(refreshTokenId: any){
    // return new Promise(resolve => {
      console.log("Google-calendar:: The refreshTokenId is:", refreshTokenId);
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
        // resolve(this.refreshToken);
        console.log("Google-calendar::getRefreshToken(): success, got RT!", this.refreshToken);
        console.log("Google-calendar::getRefreshToken(): id:", data);
      }, (error) => {
        console.log("Google-calendar::getRefreshToken(): failed!", error);
      });
    // });
  }

  getRefreshTokenId(serverAuthCode: any){
    console.log("Google-calendar:: serverAuthCode is:", serverAuthCode);
    // return new Promise(resolve => {
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
         this.getRefreshToken(data['refresh_token']);
        // resolve(this.refreshToken);
        console.log("Google-calendar::getRefreshTokenId(): id:", data);
      }, (error) => {
        console.log("Google-calendar::getRefreshTokenId(): failed!", error);
      });
    // });
  }

  // getList(authToken: string){
  //   //  This was taken from the angular 2 documenation on how to set HttpHeaders
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Content-Type':  'application/json',
  //       'Authorization': 'Bearer ' + authToken
  //     })
  //   };
  //
  //   if (this.events) {
  //     // if events already exists, promise will resolve and promise can
  //     // be call from outside function to obtain data.
  //     return Promise.resolve(this.data);
  //   }
  //
  //   // Don't have data yet
  //   return new Promise(resolve => {
  //     this.http.get(this.calendarUrl + this.eventList, httpOptions).subscribe(data => {
  //       this.data = data['summary'];
  //       console.log("Google-calendar::getList(): summary is:", this.data);
  //       console.log("Google-calendar::getList(): list is:", data);
  //       resolve(this.data);
  //     }, (error) => {
  //       // If error, let's try to get the refresh token. The time for the
  //       // original token may have expired.
  //       this.getRefreshToken();
  //       console.log(error);
  //     });
  //   });
  // }
}
