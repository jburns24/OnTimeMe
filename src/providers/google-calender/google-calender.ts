import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map'; // import this for map method

@Injectable()
export class GoogleCalender {
  data: any;
  events: any;
  calendarUrl: any =  'https://www.googleapis.com/calendar/v3';
  eventList: any = '/calendars/primary/events';
  //oAuthUrl: any = 'https://accounts.google.com/o/oauth2/v2/auth';
  //headers: any = new HttpHeaders().set('Authorization', 'OAuth'+this.user.accessToken);
  //YOUR_API_KEY: any = 'AIzaSyCd2_BU_cFW0iNfnDdOrr_HGa5k7DvtkLM';
  //colors: any = '/colors?key={this.key}';
  //idToken: any;
  //userName: any;


  constructor(public http: HttpClient) {
    console.log('Hello GoogleCalenderProvider Provider');
  }

  // This function tests google calendar api
  getList(){
    if (this.events) {
      // if events already exists, promise will resolve and promise can
      // be call from outside function to obtain data.
      return Promise.resolve(this.data);
    }

    // Don't have data yet
    return new Promise(resolve => {
      // GET calendar for primary evets list
      //console.log("GOOGLE::getList(): idToken:", this.idToken);
      //console.log("GETLIST() IN CALENDER CALLED BEFORE GET REQUEST");
      //console.log("HEADERS = ", this.headers);
      this.http.get(this.calendarUrl + this.eventList).subscribe(data => {
      //this.http.get('https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=10&key='+this.YOUR_API_KEY).subscribe(data => {
        //this.events = data[''];
        console.log("Google-calendar::getList(): list is:", data);
        //console.log("GOOGLE::getList(): idToken:", this.user.idToken);
        //resolve the promise if successful
        resolve(this.data);
      }, (error) => {
        console.log(error);
      });
    });
  }


  load() {
    if (this.data) {
      // already loaded data
      return Promise.resolve(this.data);
    }

    // don't have the data yet
    return new Promise(resolve => {
      // We're using Angular HTTP provider to request the data,
      // then on the response, it'll map the JSON data to a parsed JS object.
      // Next, we process the data and resolve the promise with the new data.
      this.http.get('https://randomuser.me/api/?results=10')
        .subscribe(data => {
          // we've got back the raw data, now generate the core schedule data
          // and save the data for later reference
          this.data = data['results'];
          console.log(data);
          resolve(this.data);
          console.log("After data resolved:", this.data);
        }, (error) => {
          console.log(error);
        });
    });
  }
}
