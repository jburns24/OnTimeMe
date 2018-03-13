import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map'; // import this for map method

@Injectable()
export class GoogleCalender {
  data: any;
  events: any;
  calendarUrl: any =  'https://www.googleapis.com/calendar/v3';
  eventList: any = '/calendars/primary/events';

  constructor(public http: HttpClient) {
    console.log('Hello GoogleCalenderProvider Provider');
  }


  // This function tests google calendar api
  getList(authToken: string){

    //  This was taken from the angular 2 documenation on how to set HttpHeaders
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + authToken
      })
    };
    if (this.events) {
      // if events already exists, promise will resolve and promise can
      // be call from outside function to obtain data.
      return Promise.resolve(this.data);
    }

    // Don't have data yet
    return new Promise(resolve => {
      this.http.get(this.calendarUrl + this.eventList, httpOptions).subscribe(data => {
        console.log("Google-calendar::getList(): list is:", data);
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
