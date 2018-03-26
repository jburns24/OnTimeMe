import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserProvider } from '../user/user';
import { NativeStorage } from '@ionic-native/native-storage';
// import { HoursMinutesSecondsPipe } from '../../pipes/hours-minutes-seconds/hours-minutes-seconds'
//import { GoogleCalendar } from '../google-calendar/google-calendar';


@Injectable()
export class Events {

  constructor(public http: HttpClient, private user: UserProvider, private storage: NativeStorage,
  /*private googleCalendar: GoogleCalendar*/) {
  }

  // Stores todays events in a new object in storage with the naming convention of
  // user.id + events for example 111696224874024244260events
  // expects a josn object of the Events.list api call
  storeTodaysEvents(jsonString:any ){
    let todaysEventList = [];
    let data = JSON.parse(jsonString);
    let events = data['items'];
    console.log("events::storeTodaysEvents() are ", events);
    for (let event of events) {
      let start = event['start'];
      let end = event['end'];
      let beginTime = Date.parse(start['dateTime']) / 1000;
      let finishTime = Date.parse(end['dateTime']) / 1000;

      let new_event = {
        id: event['id'],
        summary: event['summary'],
        location: event['location'],
        startTime: beginTime,
        endTime: finishTime
      };
      todaysEventList.push(new_event);
    }

    let user = this.user;
    let event_list_object = {
      eventList: todaysEventList
    };
    return user.getUserInfo().then(() => {
      let event_key = user.id + 'events';
      this.storage.setItem(event_key, event_list_object).then(() => {
        console.log('events saved to user!!');
      }, (err) => {
        console.log('events::storeTodaysEvents failed to store events ', err);
      });
    }, (err) => {
      console.log('events::storeTodaysEvents failed to get user ', err);
    }); 
  }

  /**
   *  Gets todays events and marks event.ongoing if the event is happening now
   */
  getTodaysEvents() {
    return new Promise (resolve => {
      this.user.getUserInfo().then(() => {
        this.storage.getItem(this.user.id + 'events').then((eventList) => {
          let events = eventList['eventList'];
          console.log("got the event list!!", events);
          let modEventList = [];
          let now = Date.now() / 1000;
          for (let event of events) {
            let ongoing = 0;
            if (now >= event['startTime']) {
              ongoing = 1;
            }
            let new_event = {
              id: event['id'],
              summary: event['summary'],
              location: event['location'],
              startTime: event['startTime'],
              endTime: event['endTime'],
              happening: ongoing,
            };
            modEventList.push(new_event);
          }
          console.log("modified event list is ", modEventList);
          resolve(modEventList);
        }, (err) => {
          console.log('failed to get users events object ', err);
        });
      }, (err) => {
        console.log('events::getTodaysEvents() failed to fetch events ', err);
      });
    });
  }
}