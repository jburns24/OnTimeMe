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
  todaysEpoch = Date.now();
  location: any;
  epochNow: any;
  lastUpdateTime: any;
  connected: Subscription;
  disconnected: Subscription;
  onToast: any;
  offToast: any;
  lastMode: any;
  // Use this flag to protect critical section
  // when device is offline
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
    private network: Network){

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
    this.onToast = this.toast.create({
      message: 'You are now ' + connectionState + ' via '+ networkType,
      duration: 4000
    });
    this.onToast.present();
  }

  onDisconnectUpdate(){
    this.offToast = this.toast.create({
      message: 'You are offline. You will not be able make new requests.',
      position: 'bottom',
      duration: 4000
    });
    this.offToast.present();
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

  start(){
    this.locationTracker.startTracking().then(() => {
      this.user.getUserInfo().then((user) => {
        this.googleCalendar.init(user.serverAuthCode).then(() => {
          this.getList(this.googleCalendar.refreshToken).then(() => {
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

  getList(authToken: any){
    return new Promise (resolve => {
      this.googleCalendar.getList(authToken).then( (list) => {
        console.log("list is ", list);
        this.events = list;
        this.event.storeTodaysEvents(JSON.stringify(this.events)).then(() => {
          console.log('home::getList() successfully saved todays events');
          this.event.getTodaysEvents().then((events) =>{
            this.eventList = events;
            this.epochNow = this.realTimeClock.getEpochTime().do(() => ++this.todaysEpoch);
            this.epochNow = this.epochNow.share();
            // SUCCESSFULLY GOT LIST, This is the time when you need to store to last known
            let date = new Date();
            this.user.getUserInfo().then((user) => {
              this.storage.getItem(user.id).then((curUser) => {
                this.storage.setItem('lastKnown', {mode: curUser.mode, time: date}).then(() => {
                  this.storage.getItem('lastKnown').then((last) => {
                    this.lastMode = last.mode;
                    this.lastUpdateTime = last.time;
                  }, (error) => { console.log("Home::getList():", error) });
                }, (error) => { console.log("Home::getList():", error) });
              }, (error) => { console.log("Home::getList():", error) });
            }, (error) => { console.log("Home::getList():", error) });
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
      this.getList(this.googleCalendar.refreshToken).then(() => {
        refresher.complete();
      }, (err) => { console.log("home::getList() error", err) });
    } else {
      refresher.complete();
    };
  }
}
