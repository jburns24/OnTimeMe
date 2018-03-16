import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
//import { GoogleCalendar } from '../google-calendar/google-calendar';


@Injectable()
export class Events {


  constructor(public http: HttpClient,
  /*private googleCalendar: GoogleCalendar*/) {
  }

/*getEvents(){
  this.googleCalendar.getList().then(data => {

  })
}*/

}
