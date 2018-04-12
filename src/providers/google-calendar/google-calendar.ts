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

  constructor(public http: HttpClient,
    private storage: NativeStorage) {
    }

  // See if refreshToken exists
  init(serverAuthCode?: any) : Promise<any>{
    return new Promise(resolve => {
      this.storage.getItem('refreshToken').then((RT) => {
        console.log("Google-calendar::init(): refreshToken already stored:,", RT.token);
        // If it does skip the auth step to get RT, and go get accessToken
        // using RT
        resolve(this.getTempAuthToken(RT.token));
      }, (error) => {
        console.log("Google-calendar::init(): refreshToken not set:", error);
        // Else, we need to get RT using the authCode from initial scope
        resolve(this.getRefreshTokenId(serverAuthCode));
      });
    });
  }

  // Go to this step if no RT is found. This step gives you a RT and an accessToken.
  // We ignore the accessToken, and use the RT to get a new refreshed accessToken.
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
        console.log("Google-calendar::getRefreshTokenId(): succesfully got RT_id", data);
        let refreshToken = data['refresh_token'];
        this.storage.setItem('refreshToken', { token: refreshToken });
        resolve(this.getTempAuthToken(data['refresh_token']));
      }, (error) => {
        console.log("Google-calendar::getRefreshTokenId(): failed!", error);
      });
    });
  }

  // Get the refresh authToken that we will need for calendar api calls
  getTempAuthToken(refreshTokenId: any){
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
        let accessToken = data['access_token'];
        console.log("Google-calendar::getTempAuthToken(): successfully got accessToken", accessToken);
        resolve(accessToken);
      }, (error) => {
        console.log("Google-calendar::getTempAuthToken(): failed!", error);
      });
    });
  }

  //  Use the authToken from above method to make the api call
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
      return Promise.resolve(this.data);
    };

    // Don't have data yet
    return new Promise(resolve => {
      this.http.get(this.calendarUrl + this.eventList + urlParams, httpOptions).subscribe(data => {
        resolve(data);
      }, (error) => {
        console.log("Google-calendar::getList(): cannot get list, token expired:", error);
        console.log("===>>>> using refresh token to get new authToken");
        this.init().then((newAuthToken) => {
          resolve(this.getList(newAuthToken));
        });
      });
    });
  }
}
