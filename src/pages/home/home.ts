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
<<<<<<< HEAD
=======
// import { LocalNotification } from '../../providers/local-notification/local-notification';
import { LocalNotifications } from '@ionic-native/local-notifications';

>>>>>>> d7dff61... testing done for the local notification. An example is provided int he ionViewDidEnter() method of the home page.

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
  epochNow: any;
  lastUpdateTime: any;
  lastLocation: any;
  connected: Subscription;
  disconnected: Subscription;
  lastMode: any;

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
<<<<<<< HEAD
    private network: Network){
=======
    private network: Network,
    private localNotification: LocalNotifications){
>>>>>>> d7dff61... testing done for the local notification. An example is provided int he ionViewDidEnter() method of the home page.

  }

  /*
   * Using ion-views to control the flow of things. Much easier, also keeps
   * updated values in tact. Use subscribe to subscribe to an observable so
   * that the time-lived is longer. Promise will only return 1 time.
   */
  ///////////////////////// ION-VIEW BEGINS ////////////////////////////////////
  ionViewWillEnter(){
    console.log("ionViewWillEnter");
    this.enableMenu();
    this.init();
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
<<<<<<< HEAD
=======
    /////// TESTING GROUNDS FOR LOCAL NOTIFICATION ////////////////
    this.localNotification.requestPermission().then((permission) => {
      console.log("Home::ionViewDidEnter(): user allowed local notification", permission);
    });
    this.localNotification.schedule({
      title: 'Testing Notification',
      text: 'Do you like me?',
      autoClear: true,
    // vibrate: true,
    // sticky: false, //Ongoing
     launch: true,
     lockscreen: true
    });
    ////////////////////////////////////////////////////////
>>>>>>> d7dff61... testing done for the local notification. An example is provided int he ionViewDidEnter() method of the home page.
    this.checkMode();
    this.connected = this.network.onConnect().subscribe(data =>{
      console.log("Home::ionViewDidEnter(): connected to internet,", data);
      this.enableFunctionality = true;
      this.onConnectUpdate(data.type);
    }, (error) => {
      console.log("Home::ionViewDidEnter(): error,", error);
    });

    this.disconnected = this.network.onDisconnect().subscribe(data => {
      console.log("Home::ionViewDidEnter(): disconncted from internet,", data);
      this.enableFunctionality = false;
      this.onDisconnectUpdate();
    }, (error) => {
      console.log("Home::ionViewDidEnter(): error on disconnect,", error);
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
      console.log("Home::init(): done initializing user profile,");
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
          console.log("Home::checkMode(): mode already set:", this.lastMode);
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

  start(){
      this.user.getUserInfo().then((user) => {
        this.googleCalendar.init(user.serverAuthCode).then((authToken) => {
          this.getList(authToken).then((list) => {
            console.log("Home::start(): got list,", list);
          }, (err) => {
            console.log("home::getList() error", err);
          });
        }, (err) => {
          console.log("gogoleClaendar init() error", err);
        });
      }, (err) => {
        console.log("GetUserInfor error", err);
      });
  }

  showRadioAlert(){
    if (this.enableFunctionality){
      this.trans.showRadioAlert(this.lastMode).then((mode) => {
        this.lastMode = mode;
        this.start();
        console.log("Home::showRadioAlert(): promise returned:", this.lastMode);
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
        console.log("list is ", list);
        this.events = list;
        this.event.storeTodaysEvents(JSON.stringify(this.events)).then(() => {
          console.log('home::getList() successfully saved todays events');
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
      resolve(this.event);
    });
  }

  enableMenu(){
    this.menu.enable(true);
  }

  doRefresh(refresher){
    if (this.enableFunctionality){
      this.googleCalendar.init().then((authToken) => {
        this.getList(authToken).then(() => {
          refresher.complete();
        }, (err) => { console.log("home::doRefresh(): error", err) });
      }, (err2) => { console.log("Home::doRefresh(): googleCalendar init() failed", err2) });
    } else {
      refresher.complete();
    };
  }
}
