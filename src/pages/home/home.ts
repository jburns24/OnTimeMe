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
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator';

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
  noEvents: any;
  Math: any = Math; // Needed for home.html bindings.
  alertedEvent: any = null;
  alertedEventMode: any = null;

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
    private localNotification: LocalNotifications,
    private launchNavigator: LaunchNavigator){

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
    this.checkMode().then((retValue) => {
    });
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
    return new Promise(resolve => {
      if (this.enableFunctionality){
        this.user.getUserInfo().then((user) => {
          this.storage.getItem(user.id).then((curUser) => {
            this.lastMode = curUser.mode;
            resolve(this.start());
          }, (error) => {
            console.log("Home::checkMode(): mode not set yet:", error);
            let nullMode = undefined;
            let title = "Please select your default mode of transportation.";
            this.trans.showRadioAlert(nullMode, title).then((mode) => {
              console.log("mode", mode);
              if (mode === null){
                this.checkMode();
              } else {
                this.lastMode = mode;
                console.log("Home::checkMode(): promise returned:", this.lastMode);
                resolve(this.start());
              };
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
          resolve(0);
        }, (error) => {
          console.log("Home::checkMode(): cannot retrieve last known", error);
        });
      };
    });
  }

  // Calling this method should resolved listLength if methods return correctly.
  start(){
    return new Promise(resolve => {
      this.user.getUserInfo().then((user) => {
        this.googleCalendar.init(user.serverAuthCode).then((authToken) => {
          this.getList(authToken).then((listLength) => {
            if (listLength === 0){
              this.noEvents = true;
            } else {
              this.noEvents = false;
            };
            console.log("Home::start(): getList returned with event list length:", listLength);
            resolve(listLength);
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

  selectEventsMode(){
    if (this.enableFunctionality){
      let title = "Change transportation mode for all events?";
      this.trans.showRadioAlert(this.lastMode, title).then((mode) => {
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

  // @return The length of the eventsList.
  getList(refreshToken: any){
    return new Promise (resolve => {
      this.googleCalendar.getList(refreshToken).then( (list) => {
        this.events = list;
        this.event.storeTodaysEvents(JSON.stringify(this.events)).then(() => {
          console.log('Home::getList(): successfully saved todays events:', this.events);
          this.event.getTodaysEvents().then((events) =>{
            if (events === 0){
              console.log("Home::getList(): user has no events");
              resolve(0);
            } else {
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
                        this.lastLocation = loc.origin;
                        resolve(this.eventList.length);
                      }, (error5) => { console.log("Home::getList():,", error5) });
                    }, (error4) => { console.log("Home::getList():", error4) });
                  }, (error3) => { console.log("Home::getList():", error3) });
                }, (error2) => { console.log("Home::getList():", error2) });
              }, (error1) => { console.log("Home::getList():", error1) });
            };
            /////////////////////////////////////////////////////////////////////////////
            console.log('Home::getList(): successfully got user events ', events);
          }, (err) => { console.log('Home::getList(): failed to get saved events', err) });
        }, (err) => { console.log('Home::getList(): failed to save events ', err) });
      }, (error) => { console.log("Home::getList(): error:", error) });
    });
  }

  // Schedule local notification for each event here...
  scheduleAlert(event: any){
    return new Promise(resolve => {
      this.localNotification.schedule({
        title: 'Yous gonna be late yo!!!',
        text: 'Time to leave for event: ' + event.summary + '!!!',
        sound: 'res://platform_default', // User's default sound
        vibrate: true,
        launch: true,
        wakeup: true,
        autoClear: true,
        lockscreen: true,
        led: true,
        priority: 2, // 2 is max and -2 is lowest
        actions: [
          { id: 'mode', launch: true, title: 'Change Transport Mode?'},
          { id: 'map', title: 'MAP',  }
        ]
      });
      this.localNotification.on('map').subscribe(() => {
        this.launchMap(event.location);
        resolve("alerting");
      });
      this.localNotification.on('mode').subscribe(() => {
        this.selectEventsMode();
        resolve("alerting");
      });
    });
  }

  // Calls scheduleAlert to send out an alert.
  doesEventNeedAlert(eventParam: any){
    console.log("event id is", eventParam.id);
    if ((this.alertedEvent != eventParam.id) && (this.alertedEventMode != eventParam.mode)){
      this.alertedEvent = eventParam.id;
      this.alertedEventMode = eventParam.mode;
      console.log("Home::alertNow(): EVENT alerted:", eventParam.summary, "with mode:", eventParam.mode);
      this.scheduleAlert(eventParam);
      return;
    }
    else {
      console.log("Home::alertNow(): ", eventParam.summary, "already alerted!");
      return;
    };
  }

  launchMap(eventLocation: any){
    let dest = eventLocation;
    let options: LaunchNavigatorOptions = {
      enableDebug: true,
      // start: 'Chico, CA',
      transportMode: this.launchNavigator.TRANSPORT_MODE.WALKING,
      // enableGeocoding: true,
      app: this.launchNavigator.APP.GOOGLE_MAPS
    };

    this.launchNavigator.navigate(dest, options).then((success) =>{
      success => console.log("Home:: launched navigator works");
      error => console.log("Home:: lauching failed.");
    });
  }

  changeModeForEvent(event: any){
    console.log("EVENT PARM ID", event.id);
    this.trans.getNewMode(event).then((mode) => {
      console.log("NEW MODE IS", mode);
      this.event.storeTodaysEvents(JSON.stringify(this.events), mode, event).then(() => {
        this.checkMode();
      });
    });
  }

  doRefresh(refresher){
    if (this.enableFunctionality){
      console.log("-------------- REFRESH START -------------")
      this.checkMode().then((retValue) => {
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
