import { Component } from '@angular/core';
import { MenuController, ToastController } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user';
import { GoogleCalendar} from '../../providers/google-calendar/google-calendar';
import { NativeStorage } from '@ionic-native/native-storage';
import { RealTimeClockProvider } from '../../providers/real-time-clock/real-time-clock'
import { LocationTracker } from '../../providers/location-tracker/location-tracker'
import { Events } from '../../providers/events/events';
import { Transportation } from '../../providers/transportation-mode/transportation-mode';
import { Network } from '@ionic-native/network';
import { Subscription} from 'rxjs/Subscription';
// import { LocalNotification } from '../../providers/local-notification/local-notification';
import { LocalNotifications } from '@ionic-native/local-notifications';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})

export class HomePage {
  userName: any;
  userPicture: any;
  userEmail: any;
  events: any;
  refreshTokenId: any;
  authToken: any;
  eventList: any;
  location: any;
  epochNow: any = null;
  lastUpdateTime: any;
  lastLocation: any;
  connected: Subscription;
  disconnected: Subscription;
  lastMode: any;
  hasSubscribed: boolean = false;
  subscription: any;
  alertedEvents: any = [];

  // Use this flag as a condition variable
  enableFunctionality: boolean;

  constructor(
    private realTimeClock: RealTimeClockProvider,
    private menu: MenuController,
    private user: UserProvider,
    private googleCalendar: GoogleCalendar,
    private event: Events,
    public locationTracker: LocationTracker,
    private trans: Transportation,
    private storage: NativeStorage,
    private toast: ToastController,
    private network: Network,
    private localNotification: LocalNotifications){

  }

  ///////////////////////// ION-VIEW BEGINS ////////////////////////////////////

  // Do permission checks and all that here.
  ionViewCanEnter(){
    this.localNotification.requestPermission().then((permission) => {
      console.log("Home::ionViewDidEnter(): user allowed local notification", permission);
    });
  }

  // Runs when page loaded. This will fire up only once. If page leaves,
  // but is cached, it will not fire again in subsequent viewing. Good
  // place to put setup code for the page.
  ionViewDidLoad(){
    this.enableMenu();
    this.init();
}

  ionViewWillEnter(){
    // First, check to see if we have internet connection. Use the network plugin
    // type to check this. We are looking for 'none'
    if(this.network.type == 'none'){
      this.enableFunctionality = false;
      console.log("Home::ionViewWillEnter(): we are offline, enable =", this.enableFunctionality);
    } else{
      this.enableFunctionality = true;
    };
    console.log("-->>enableFunctionality:", this.enableFunctionality);
  }

  ionViewDidEnter(){
    this.connected = this.network.onConnect().subscribe(data =>{
      this.enableFunctionality = true;
      this.onConnectUpdate(data.type);
    }, (error) => {
      console.log("Home::ionViewDidEnter(): error,", error);
    });

    this.disconnected = this.network.onDisconnect().subscribe(data => {
      this.enableFunctionality = false;
      this.onDisconnectUpdate();
    }, (error) => {
      console.log("Home::ionViewDidEnter(): error on disconnect,", error);
    });

    console.log("----------------- START -----------------------");
    this.checkMode();
  }

  ionViewWillLeave(){
    this.connected.unsubscribe();
    this.disconnected.unsubscribe();
  }

  onConnectUpdate(connectionState: string){
    let networkType = this.network.type;
    let onToast = this.toast.create({
      message: 'You are now ' + connectionState + ' via '+ networkType,
      duration: 4000
    });
    onToast.onDidDismiss(() => {
      this.checkMode();
    });
    onToast.present();
  }

  onDisconnectUpdate(){
    this.toast.create({
      message: 'You are offline. You will not be able make new requests.',
      position: 'bottom',
      duration: 4000
    }).present();
  }
  /////////////////////////// End of ION-VIEW //////////////////////////////////

  init(){
    this.user.getUserInfo().then((user) => {
      this.userName = user.name;
      this.userPicture = user.picture;
      this.userEmail = user.email;
    }, (error) => {
      console.log("Home::intit(): error cant get user info,", error);
    });
  }

  checkMode(){
    if (this.enableFunctionality){
      this.user.getUserInfo().then((user) => {
        this.storage.getItem(user.id).then((curUser) => {
          this.lastMode = curUser.mode;
          this.start();
        }, (error) => {
          console.log("Home::checkMode(): mode not set yet:", error);
          let nullMode = undefined;
          this.trans.showRadioAlert(nullMode).then((mode) => {
            this.lastMode = mode;
            this.start();
            console.log("Home::checkMode(): promise returned:", this.lastMode);
          }, (error) => {
            console.log("Home::checkMode(): promise returned error,", error);
          });
        });
      });
    } else{
      this.storage.getItem('lastKnown').then((last) => {
        this.lastMode = last.mode;
        this.lastUpdateTime = last.time;
        console.log("Home::checkMode(): last know =", last);
      }, (error) => {
        console.log("Home::checkMode(): cannot retrieve last known", error);
      });
    };
  }

  // Calling this method should resolved "done" if methods return correctly.
  start(){
    return new Promise(resolve => {
      this.user.getUserInfo().then((user) => {
        this.googleCalendar.init(user.serverAuthCode).then((authToken) => {
          this.getList(authToken).then((retValue) => {
            console.log("Home::start(): got list,", retValue);
            resolve(retValue);
          }, (err) => {
            console.log("home::getList() error", err);
          });
        }, (err) => {
          console.log("gogoleClaendar init() error", err);
        });
      }, (err) => {
        console.log("GetUserInfor error", err);
      });
    });
  }

  showRadioAlert(){
    if (this.enableFunctionality){
      this.trans.showRadioAlert(this.lastMode).then((mode) => {
        this.lastMode = mode;
        this.start();
        //console.log("Home::showRadioAlert(): promise returned:", this.lastMode);
      }, (error) => {
        console.log("Home::showRadioAlert(): promise returned error,", error);
      });
    } else {
      this.toast.create({
        message: 'You are offline. Action is not possible.',
        position: 'bottom',
        duration: 4000
      }).present();
    };
  }

  // Last knowns are stored in here while retrieving and storing event list.
  getList(refreshToken: any){
    return new Promise (resolve => {
      this.googleCalendar.getList(refreshToken).then( (list) => {
        this.events = list;
        this.event.storeTodaysEvents(JSON.stringify(this.events)).then(() => {
          console.log('Home::getList(): successfully saved todays events');
          this.event.getTodaysEvents().then((events) =>{
            this.eventList = events;
            this.epochNow = this.realTimeClock.getEpochTime();
            this.epochNow = this.epochNow.share();
            // SUCCESSFULLY GOT LIST, This is the time when you need to store to last known
            let date = new Date();
            this.user.getUserInfo().then((user) => {
              this.storage.getItem(user.id).then((curUser) => {
                this.storage.setItem('lastKnown', {mode: curUser.mode, time: date}).then(() => {
                  this.storage.getItem('lastKnown').then((last) => {
                    this.storage.getItem('lastKnownLocation').then((loc) => {
                      this.lastMode = last.mode;
                      this.lastUpdateTime = last.time;
                      this.lastLocation = loc.origin; // stored in events provider
                      //resolve(this.scheduleAlert(this.eventList));
                      resolve("done");
                    }, (error5) => { console.log("Home::getList():,", error5) });
                  }, (error4) => { console.log("Home::getList():", error4) });
                }, (error3) => { console.log("Home::getList():", error3) });
              }, (error2) => { console.log("Home::getList():", error2) });
            }, (error1) => { console.log("Home::getList():", error1) });
            /////////////////////////////////////////////////////////////////////////////
            console.log('Home::getList(): successfully got user events ', events);
          }, (err) => { console.log('Home::getList(): failed to get saved events', err) });
        }, (err) => { console.log('Home::getList(): failed to save events ', err) });
      }, (error) => { console.log("Home::getList(): error:", error) });
    });
  }

  // Schedule local notification for each event here...
  scheduleAlert(event: any/*eventsList: any*/){
    return new Promise(resolve => {
      // this.alertEpoch = this.realTimeClock.getEpochTime();
      // this.alertEpoch = this.alertEpoch.share();
      // if (this.hasSubscribed){
      //   this.subscription.unsubscribe();
      // };

      // this.epochNow = this.realTimeClock.getEpochTime();
      // this.epochNow = this.epochNow.share();

      //this.hasSubscribed = true;

      //for (let event of eventsList){
        //this.subscription = this.epochNow.subscribe((epochSubscriber) => {
          //if (((event.startTime - event.trip_duration) - epochSubscriber) === 0){
          // this.user.getUserInfo().then((user) => {
          //   let key = user.id + event.id;
          //   this.storage.setItem(key, {flag: true}).then(() => {
          //     this.storage.getItem(key).then((alerted) => {
          //       console.log("flag is :", alerted.flag, "eventId is:", event.id);
          //
          //   this.localNotification.schedule({
          //     title: 'Testing local notification',
          //     text: 'Time to leave for event: ',/// + event.summary + '!!!',
          //     sound: 'file://sound.mp3',
          //     vibrate: true,
          //     launch: true,
          //     wakeup: true,
          //     autoClear: true,
          //     lockscreen: true
          //   });
          //
          //     });
          //   });
          // });
          //console.log("I have alerted:", event.id);
          this.user.getUserInfo().then(user => {
            this.storage.getItem(user.id).then(curUser => {
              this.storage.setItem(user.id, {mode: curUser.mode, eventId: event.id});
              //console.log("I have successfully set :", event.id);
              resolve("done");
            });
          });
            //console.log("Home::scheduleAlert(): testing timer", this.epochNow);
            //console.log("Home::scheduleAlert(): subscriber:", epochSubscriber);
          //};
        //});
      //}
      // console.log("Home::scheduleAlert(): eventsList param is:", eventsList);
      // console.log("Home::scheduleAlert(): eventsList param size is:", eventsList.length);
    });
  }

  alertNow(eventList: any, eventParam: any){
    return new Promise (resolve => {
    // There are 3 ways to implement this, this is one way:
    // 1. events will have a property alerted. If you are here this means that alerted = false.
    // 2. Need to get events list from local storage to get starttime and all that sort.
    // 3. make the alerted property of event at index to true.
    // 4. store the flag to local storage using userId + eventId as the key.
    // 4b. if cant find in local storage that means its not set, so make alerted flag == false.
    // 5. then set the flag appropriately to the alerted flag of the event.
    // 6. store it back in the local storage.
    // this.alertedEvents.push(eventParam.id);

    //console.log("EVENT ID:", eventParam.summary);
    // resolve("done");
  //  console.log("EVENT LIST WITH TRIP IS:", eventList);
    this.user.getUserInfo().then(user => {
      this.storage.getItem(user.id).then((alreadyAlerted) => {
        if (eventParam.id === alreadyAlerted.eventId){
          //console.log("Home::alertNow(): already alerted event id:", alreadyAlerted.eventId);
          resolve("already alerted");
        } else{
          resolve(this.scheduleAlert(eventParam));
        };
      });
    });


    // let eventListWithTrip: any;
    // let counter = 0;
    // let flag = false;
    // for (let event of eventList) {
    //     counter = counter + 1;
    //     if (event.id === eventParam.id){
    //       flag = true;
    //       console.log("FLAG IS:", flag);
    //     };
    //   // }
    //
    //     let event_with_trip = {
    //       id: event['id'],
    //       summary: event['summary'],
    //       location: event['location'],
    //       startTime: event['startTime'],
    //       endTime: event['endTime'],
    //       happening: event['happening'],
    //       trip_duration: event['trip_duration'],
    //       alerted: flag,
    //       //index: tempIndex
    //     };
    //
    //     eventListWithTrip.push(event_with_trip);
    //     eventListWithTrip.sort((a:any, b:any) => {
    //       if(a.startTime < b.startTime) {
    //         return -1;
    //       }
    //       else if(a.startTime > b.startTime) {
    //         return 1;
    //       }
    //       else {
    //         return 0;
    //       }
    //     });
    //
    //     if (counter === eventList.length){
    //       this.storage.setItem('eventWithTrip', JSON.stringify(eventListWithTrip)).then(() => {
    //         console.log("Home::alertNow(): modified eventList is:", eventListWithTrip);
    //       })
    //     };
    // }
    // This is another way
    // this.user.getUserInfo().then((user) => {
    //   let key = user.id + event.id;
    //   this.storage.getItem(key).then((alerted) => {
    //     // if (!alerted.flag){
    //     //   console.log("Home::alertNow(): event <", event.summary, "> has already been alerted!");
    //     //   return;
    //     // }
    //     // Else we scheduleAlert to alert now!
    //     console.log("Home::alertNow(): flag is :", alerted.flag, "eventId is:", event.id);
    //   }, (error) => {
    //     this.scheduleAlert(event);
    //     console.log("Home::alertNow(): flag not found, schedule an alert", error);
    //   });
    // });

    // The other way is to edit the html and remove the async for the epochNow.
    // Have the observers (events) subscribe to the epochNow in this component.
    // Then in the html dont use the async (using it will make the timer incorrect).
    // Instead pass the subscription to the html so that it will update the timer appropriately.
    //resolve("DONE");
  });
  }

  doRefresh(refresher){
    if (this.enableFunctionality){
      console.log("-------------- REFRESH START -------------")
      this.start().then((retValue) => {
        refresher.complete();
      }, (err) => { console.log("home::doRefresh(): error", err) });
    } else {
      refresher.complete();
    };
  }

  enableMenu(){
    this.menu.enable(true);
  }
}
