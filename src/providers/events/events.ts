import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserProvider } from '../user/user';
import { NativeStorage } from '@ionic-native/native-storage';
import { Map } from '../../providers/map/map';
import { LocationTracker } from '../../providers/location-tracker/location-tracker'


@Injectable()
export class Events {
  mode: any;
  now: any;
  modEventList: any;
  eventListWithTrip: any;

  constructor(public http: HttpClient,
              private user: UserProvider,
              private storage: NativeStorage,
              private map: Map,
              private locationTracker: LocationTracker,
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

    let event_list_object = {
      eventList: todaysEventList
    };
    return this.user.getUserInfo().then((user) => {
      let event_key = user.id + 'events';
      this.storage.setItem(event_key, event_list_object).then(() => {
        console.log('Events::events saved to user!!');
      }, (err) => {
        console.log('Events::storeTodaysEvents failed to store events ', err);
      });
    }, (err) => {
      console.log('Events::storeTodaysEvents failed to get user ', err);
    });
  }

  /**
   *  Returns an array of events, each event will have all of these
   *
   *  id: Unique google eventId
   *  summary: User defined summary of event
   *  location: String address of event
   *  startTime: EPOCH start time in seconds
   *  entTime:  EPOCH end time in seconds
   *  happening: bit value indication event is ongoing or not
   *  trip_duration:  miliseconds till event in seconds
   */
  getTodaysEvents() {
    return new Promise (resolve => {
      this.now = Date.now() / 1000;
      this.modEventList = [];
      this.eventListWithTrip = [];
      this.user.getUserInfo().then((user) => {
        this.storage.getItem(user.id + 'events').then((eventList) => {
          let events = eventList['eventList'];
          console.log("got the event list!!", events);
          this.map.getPreferenceMode().then((mode) => {
            this.mode = mode;
            for (let event of events) {
              let ongoing = 0;
              // Skipping any event that does not have a location.
              if(typeof event['location'] === 'undefined') {
                continue;
              }
              if (this.now >= event['startTime']) {
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
              this.modEventList.push(new_event);
            }
            console.log("modified event list is ", this.modEventList);
            for (let eventd of this.modEventList) {
              let origin = this.locationTracker.lat + ',' + this.locationTracker.lng;
              this.map.getDistance(eventd['location'], mode, origin).then ((suc) => {
                // Recreate event list with trip duration
                console.log('Home::getList(): successfully got distance:', suc)
                let rows = suc['rows'];
                let row = rows[0];
                let elements = row['elements'];
                let element = elements[0];
                let duration = element['duration'];
                let event_with_trip = {
                  id: eventd['id'],
                  summary: eventd['summary'],
                  location: eventd['location'],
                  startTime: eventd['startTime'],
                  endTime: eventd['endTime'],
                  happening: eventd['happening'],
                  trip_duration: duration['value'],
                };
                this.eventListWithTrip.push(event_with_trip);
                this.eventListWithTrip.sort((a:any, b:any) => {
                  if(a.startTime < b.startTime) {
                    return -1;
                  }
                  else if(a.startTime > b.startTime) {
                    return 1;
                  }
                  else {
                    return 0;
                  }
                });
                // Store for offline use...add to this later on....
                this.storage.setItem('lastKnownLocation', {origin: suc['origin_addresses']});
              }, (error) => {
                console.log('Home::getList(): failed to get distance:', error);
              });
            }
            console.log('The recreate event list with trip distance ', this.eventListWithTrip);
            resolve(this.eventListWithTrip);
          },(err) =>{
            console.log('events::getTodaysEvents, failed to get prefrence mode', err);
          });
        }, (err) => {
          console.log('failed to get users events object ', err);
        });
      }, (err) => {
        console.log('events::getTodaysEvents() failed to fetch events ', err);
      });
    });
  }
}
