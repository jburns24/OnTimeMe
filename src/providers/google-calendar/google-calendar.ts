import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class GoogleCalendar {
  data: any;
  events: any;
  calendarUrl: any = 'https://www.googleapis.com/calendar/v3';
  eventList: any = '/calendars/primary/events';

  constructor(public http: HttpClient) {
  }

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
        this.data = data['summary'];
        console.log("Google-calendar::getList(): summary is:", this.data);
        console.log("Google-calendar::getList(): list is:", data);
        resolve(this.data);
      }, (error) => {
        console.log(error);
      });
    });
  }
}
