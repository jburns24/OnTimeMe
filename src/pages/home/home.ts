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
  transMode: any;
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
    // First, check to see if we have internet connection. Use the network plugin
    // type to check this. We are looking for 'none'
    if(this.network.type == 'none'){
      this.enableFunctionality = false;
      console.log("Home::ionViewWillEnter(): we are offline, enable =", this.enableFunctionality);
      this.onDisconnectUpdate();
    };

    this.connected = this.network.onConnect().subscribe(data =>{
      console.log("Home::ionViewDidEnter(): connected to internet,", data);
      this.offToast.dismiss();
      this.offToast.onDidDismiss(() => {
        this.enableFunctionality = true;
      });
      this.onConnectUpdate(data.type);
    }, (error) => {
      console.log("Home::ionViewDidEnter(): error,", error);
    });
    // if (!this.enableFunctionality){
    //   console.log("Home::constructor(): enable is false");
    //   let date = new Date().toISOString();
    //   this.user.getUserInfo().then((user) => {
    //     this.storage.getItem(user.id).then(curUser => {
    //       this.storage.setItem('lastKnown', {mode: curUser.mode, time: date}).then(() => {
    //         this.storage.getItem('lastKnown').then((last) => {
    //           this.lastMode = last.mode;
    //           this.lastUpdateTime = last.time;
    //         });
    //       });
    //     });
    //   });
    // }
    this.enableMenu();
    this.init();
    this.checkMode();
    console.log("-->>enableFunctionality:", this.enableFunctionality);
  }

  ionViewDidLeave(){
    this.offToast.dismiss();
  }

  ionViewDidEnter(){
    console.log("ionViewDidEnter", this.network.type);
    this.disconnected = this.network.onDisconnect().subscribe(data => {
      console.log("Home::ionViewDidEnter(): disconncted from internet,", data);
      this.enableFunctionality = false;
      this.onDisconnectUpdate();
    }, (error) => {
      console.log("Home::ionViewDidEnter(): error on disconnect,", error);
    });

    // this.connected = this.network.onConnect().subscribe(data =>{
    //   console.log("Home::ionViewDidEnter(): connected to internet,", data);
    //   this.offToast.dismiss();
    //   this.offToast.onDidDismiss(() => {
    //     this.enableFunctionality = true;
    //   });
    //   this.onConnectUpdate(data.type);
    // }, (error) => {
    //   console.log("Home::ionViewDidEnter(): error,", error);
    // });
  }

  onConnectUpdate(connectionState: string){
    let networkType = this.network.type;
    this.onToast = this.toast.create({
      message: 'You are now ' + connectionState + ' via '+ networkType,
      duration: 5000
    });
    this.onToast.onDidDismiss(() => {
      this.checkMode();
    });
    this.onToast.present();
  }

  onDisconnectUpdate(){
    this.storage.getItem('lastKnown').then((data) => {
      this.lastMode = data.mode;
      this.lastUpdateTime = data.time;
    });

    this.offToast = this.toast.create({
      message: 'You are offline. Time estimates may not be accurate. The above shows your last update.',
      position: 'bottom',
      dismissOnPageChange: false,
      showCloseButton: false
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
    this.user.getUserInfo().then((user) => {
      this.storage.getItem(user.id).then((curUser) => {
        this.transMode = curUser.mode;
        this.start();
        console.log("Home::checkMode(): mode already set:", curUser.mode);
      }, (error) => {
        console.log("Home::checkMode(): mode not set yet:", error);
        let nullMode = undefined;
        this.trans.showRadioAlert(nullMode).then((mode) => {
          this.transMode = mode;
          this.start();
          console.log("Home::checkMode(): promise returned:", this.transMode);
        }, (error) => {
          console.log("Home::checkMode(): promise returned error,", error);
        });
      });
    });
  }

  showRadioAlert(){
    this.trans.showRadioAlert(this.transMode).then((mode) => {
      this.transMode = mode;
      this.start();
      console.log("Home::showRadioAlert(): promise returned:", this.transMode);
    }, (error) => {
      console.log("Home::showRadioAlert(): promise returned error,", error);
    });
  }

  start(){
    this.locationTracker.startTracking().then(() => {
      this.user.getUserInfo().then((user) => {
        this.googleCalendar.init(user.serverAuthCode).then(() => {
          this.getList(this.googleCalendar.refreshToken).then(() => {
            if (this.enableFunctionality){
              let date = new Date().toISOString();
              this.storage.setItem('updated', {time: date}).then(() => {
                this.storage.getItem('updated').then((update) => {
                  this.storage.setItem('lastKnown', {mode: this.transMode, time: update.time})
                  .then(() => {
                    this.storage.getItem('lastKnown').then((last) => {
                      this.lastMode = last.mode;
                      this.lastUpdateTime = last.time;
                    });
                  });
                });
              });
            };
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
        if (list == 1){
          this.enableFunctionality = false;
          return;
        };
        this.enableFunctionality = true;
        this.events = list;
        this.event.storeTodaysEvents(JSON.stringify(this.events)).then(() => {
          console.log('home::getList() successfully saved todays events');
          this.event.getTodaysEvents().then((events) =>{
            this.eventList = events;
            this.epochNow = this.realTimeClock.getEpochTime().do(() => ++this.todaysEpoch);
            this.epochNow = this.epochNow.share();
            console.log('Home::getList(): successfully got user events ', events);
          }, (err) => {
            console.log('Home::getList(): failed to get saved events', err);
          });
        }, (err) => {
          console.log('Home::getList(): failed to save events ', err);
        });
      }, (error) => {
        console.log("Home::getList(): error:", error);
      });
      resolve(this.event);
    });
  }

  enableMenu(){
    this.menu.enable(true);
  }

  doRefresh(refresher){
    this.getList(this.googleCalendar.refreshToken).then(() => {
      if (this.enableFunctionality){
        let date = new Date().toISOString();
        this.storage.setItem('lastKnown', {mode: this.transMode, time: date}).then(() => {
          this.storage.getItem('lastKnown').then((last) => {
            this.lastMode = last.mode;
            this.lastUpdateTime = last.time;
          });
          refresher.complete();
          console.log("Home::doRefresh(): successfully stored lastKnown.");
        }, (error) => {
          console.log("Home::doRefresh(): failed to store lastKnown,", error);
        });
      };
      refresher.complete();
    }, (err) => {
      console.log("home::getList() error", err);
    });
  }
}
