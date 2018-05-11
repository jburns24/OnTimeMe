import { Component } from '@angular/core';
import { MenuController, ToastController, AlertController, Platform, NavController } from 'ionic-angular';
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
import { BackgroundModeProvider } from '../../providers/background-mode/background-mode';

// import { LocalNotification } from '../../providers/local-notification/local-notification';
import { LocalNotifications } from '@ionic-native/local-notifications';

import { Geolocation, Geoposition } from '@ionic-native/geolocation';


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
  hasUber = false;
  hasLyft = false;
  backgrounded: Subscription;
  bgSubscription: Subscription;

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
    private launchNavigator: LaunchNavigator,
    private alertCrl: AlertController,
    private backgroundMode: BackgroundModeProvider,
    private platform: Platform,
    private navCtrl: NavController){

    // Call this method whenever the app resumes from being backgrounded.
    // This method will turn the background mode back on and check to see
    // if location services is turned on.
    this.platform.resume.subscribe(() => {
      console.log("------- OUR APP RESUMED FROM BACKGROUNDED ---------");
      let view = this.navCtrl.getActive().name;
      if(view == "HomePage"){
        console.log("Running functions from HomePage...");
        this.resumeAppFromBackground();
      };
    });
  }

  ionViewCanEnter(){
    this.localNotification.requestPermission().then((permission) => {
      console.log("Home::ionViewCanEnter(): user allowed local notification", permission);
    });

    this.isLocationEnabled();
    this.checkBackgroundMode();
  }

  // Runs when page loaded. This will fire up only once. If page leaves,
  // but is cached, it will not fire again in subsequent viewing. Good
  // place to put setup code for the page.
  ionViewDidLoad(){
    this.enableMenu(true);
    this.init();
}

  ionViewWillEnter(){
    if(this.network.type == 'none'){
      this.enableFunctionality = false;
      console.log("Home::ionViewWillEnter(): we are offline, enable =", this.enableFunctionality);
      this.toast.create({
        message: 'You are offline. You must connect to the internet to use this app.',
        position: 'bottom',
        duration: 4000
      }).present();
    } else{
      this.enableFunctionality = true;
    };
    console.log("-->>enableFunctionality:", this.enableFunctionality);

  }

  ionViewDidEnter(){
    this.connected = this.network.onConnect().subscribe(data =>{
      this.enableFunctionality = true;
      this.enableMenu(true);
      this.onConnectUpdate(data.type);
    }, (error) => {
      console.log("Home::ionViewDidEnter(): error,", error);
    });

    this.disconnected = this.network.onDisconnect().subscribe(data => {
      this.enableFunctionality = false;
      this.onDisconnectUpdate();
      this.enableMenu(false);
    }, (error) => {
      console.log("Home::ionViewDidEnter(): error on disconnect,", error);
    });

    this.backgrounded = this.backgroundMode.backgroundMode.on('activate').subscribe(() =>{
      this.backgroundMode.setBackgroundDefaults();
      this.backgroundMode.disableWebViewOptimizations().then(() => {
        this.backgroundMode.moveToBackground();
      });
    });

    this.platform.registerBackButtonAction((event) => {
      this.backgroundMode.disableWebViewOptimizations();
      this.backgroundMode.moveToBackground();
    });

    console.log("----------------- START -----------------------");

    // this.locationTracker.getObservable().then((observable) => {
    //   console.log("WATCHING FROM HOME:", observable);
    //   // let observablePosition = observable;
    //   // observablePosition.subscribe((data) => {
    //   //   console.log("WATCHING FROM HOME:", data);
    //   // });
    // });
    this.bgSubscription = this.locationTracker.getMessage().subscribe((position) => {
      console.log("WATCHING FROM HOME:", position);
    });

    this.checkMode().then(() => {
    });
  }

  ionViewWillLeave(){
    this.connected.unsubscribe();
    this.disconnected.unsubscribe();
    this.backgrounded.unsubscribe();
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

  init(){
    this.user.getUserInfo().then((user) => {
      this.userName = user.name;
      this.userPicture = user.picture;
      this.userEmail = user.email;
      this.checkForLyftOrUber();
    }, (error) => {
      console.log("Home::intit(): error cant get user info,", error);
    });
  }

  checkBackgroundMode(){
    return new Promise(resolve => {
      if(!this.backgroundMode.backgroundMode.isEnabled()){
        console.log("Home::ionViewWillEnter(): Background mode is off.");
        this.backgroundMode.enableBackgroundMode().then((retVal) => {
          if(retVal){
            console.log("Home::checkBackgroundMode(): Background mode is turned on");
          };
        });
      } else {
        console.log("Home::checkBackgroundMode(): Background mode is already on");
      };
    });
  }

  checkMode(){
    return new Promise(resolve => {
      if (this.enableFunctionality){
        this.user.getUserInfo().then((user) => {
          this.storage.getItem(user.id).then((curUser) => {
            this.lastMode = curUser.mode;
            let allEventFlag = false;
            resolve(this.start(allEventFlag));
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
  start(allEventFlag?: any){
    return new Promise(resolve => {
      this.user.getUserInfo().then((user) => {
        this.googleCalendar.init(user.serverAuthCode).then((authToken) => {
          this.getList(authToken, allEventFlag).then((listLength) => {
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
      this.trans.showRadioAlert(this.lastMode, title).then((allEventFlag) => {
        console.log("ALLEVENTFLAG IS", allEventFlag);
        this.user.getUserInfo().then((user) => {
          this.storage.getItem(user.id).then((user) => {
            this.lastMode = user.mode;
            this.start(allEventFlag);
          });
        });
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
  getList(refreshToken: any, allEventFlag?: any){
    return new Promise (resolve => {
      this.googleCalendar.getList(refreshToken).then( (list) => {
        this.events = list;
        this.event.storeTodaysEvents(JSON.stringify(this.events),undefined,undefined, allEventFlag).then(() => {
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
        this.launchMap(event.location, true);
        resolve("alerting");
      });
      this.localNotification.on('mode').subscribe(() => {
        this.changeModeForEvent(event);
        resolve("alerting");
      });
    });
  }

  eventOptionAlert(eventLocation: any) : Promise<any> {
    return new Promise(resolve => {
      let alert = this.alertCrl.create();
      alert.setCssClass("alertCss");
      alert.setTitle("Additional Event Options")
      let eventOptions = ['Map'];
      if (this.hasLyft)
        eventOptions.push("Lyft");
      if (this.hasUber)
        eventOptions.push("Uber");
      eventOptions.forEach(option => {
        alert.addButton({
          text: option,
          handler: () => {
            // Dirctions case
            if (option == "Map") {
              this.launchMap(eventLocation).then(() => {
                resolve(true);
              }, (err) => {
                console.log("home::eventOptionAlert launchMap failed ", err);
                resolve(false);
              });
            }
            if (option == "Uber") {
              this.launchUber(eventLocation).then(() => {
                resolve(true);
              }, (err) => {
                console.log("home::eventOptionAlert launchUber failed ", err);
                resolve(false);
              });
            }
            if (option == "Lyft") {
              this.launchLyft(eventLocation).then(() => {
                resolve(true);
              }, (err) => {
                console.log("home::eventOptionAlert launchLyft failed ", err);
                resolve(false);
              });
            }
          }
        });
      });
      alert.present();
    })
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

  checkForLyftOrUber() : Promise<boolean> {
    return new Promise (resolve => {
      this.launchNavigator.availableApps().then((appList) => {
        if (appList['uber'] == true) {
          this.hasUber = true;
        }
        if (appList['lyft'] == true) {
          this.hasLyft = true;
        }
        resolve(this.hasUber || this.hasLyft);
      }, (err) => {
        console.log("Did not get an app list from launch Navigator", err);
        resolve(this.hasUber || this.hasLyft);
      });
    });
  }

  launchLyft(eventLocation: any) : Promise<boolean> {
    return new Promise (resolve =>{
      if(this.backgroundMode.backgroundMode.isEnabled()){
        this.backgroundMode.disableBackgroundMode().then(() => {
          if(this.hasLyft) {
            let options: LaunchNavigatorOptions = {
              enableDebug: true,
              app: this.launchNavigator.APP.LYFT
            };
            this.launchNavigator.navigate(eventLocation, options);
            resolve(true);
          };
        });
      };
    });
  }

  launchUber(eventLocation: any) : Promise<boolean> {
    return new Promise (resolve =>{
      if(this.backgroundMode.backgroundMode.isEnabled()){
        this.backgroundMode.disableBackgroundMode().then(() => {
          if(this.hasUber) {
            let options: LaunchNavigatorOptions = {
              enableDebug: true,
              app: this.launchNavigator.APP.UBER
            };
            this.launchNavigator.navigate(eventLocation, options);
            resolve(true);
          };
        });
      };
    });
  }

  launchMap(eventLocation: any, fromNotify?: boolean) : Promise<any>{
    return new Promise(resolve => {
      if(this.backgroundMode.backgroundMode.isEnabled() && !fromNotify){
        this.backgroundMode.disableBackgroundMode().then(() => {
          let dest = eventLocation;
          let options: LaunchNavigatorOptions = {
            enableDebug: true,
            // start: 'Chico, CA',
            transportMode: this.launchNavigator.TRANSPORT_MODE.WALKING,
            // enableGeocoding: true,
            app: this.launchNavigator.APP.GOOGLE_MAPS
          };
          // This is supposed to be a promise but it is a sync call.
          this.launchNavigator.navigate(dest, options);
          resolve(true);
        });
      } else {
        let dest = eventLocation;
        let options: LaunchNavigatorOptions = {
          enableDebug: true,
          // start: 'Chico, CA',
          transportMode: this.launchNavigator.TRANSPORT_MODE.WALKING,
          // enableGeocoding: true,
          app: this.launchNavigator.APP.GOOGLE_MAPS
        };
        // This is supposed to be a promise but it is a sync call.
        this.launchNavigator.navigate(dest, options);
        resolve(true);
      };
    });
  }

  resumeAppFromBackground(){
    if(!this.backgroundMode.backgroundMode.isEnabled()){
      this.backgroundMode.enableBackgroundMode().then((retVal) => {
        if(retVal){
          console.log("Home::resumeAppFromBackground(): Background mode got turned on again");
        };
      });
    };
  }

  isLocationEnabled(){
    return new Promise(resolve => {
      this.locationTracker.isLocationEnabled().then((retVal) => {
        if(retVal){
          this.locationTracker.startTracking().then((watch) => {
            console.log("HomePage:: started tracking...");
            resolve(true);
          });
        } else {
          this.locationTracker.enableLocationServices();
          resolve(false);
        };
      });
    });
  }

  changeModeForEvent(event: any){
    if (this.enableFunctionality){
      this.trans.getNewMode(event).then((mode) => {
        this.event.storeTodaysEvents(JSON.stringify(this.events), mode, event, false).then(() => {
          this.checkMode();
        });
      });
    } else {
      this.toast.create({
        message: 'You are offline. Action is not possible.',
        position: 'bottom',
        duration: 4000
      }).present();
    };
  }

  doRefresh(refresher){
    if (this.enableFunctionality){
      console.log("-------------- REFRESH START -------------")
      this.locationTracker.isLocationEnabled().then((retVal) => {
        if(!retVal){
          this.locationTracker.enableLocationServices().then(() => {
            this.locationTracker.startTracking().then(() => {
              this.checkMode().then(() => {
                refresher.complete();
              }, (err) => { console.log("home::doRefresh(): error", err) });
            });
          });
        } else {
          this.checkMode().then(() => {
            refresher.complete();
          });
        };
      });
    } else {
      refresher.complete();
    };
  }

  enableMenu(value: boolean){
    this.menu.enable(value);
  }
}
