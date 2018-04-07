import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/do';
import Rx from "rxjs/Rx";
/*
  Generated class for the RealTimeClockProvider provider.

  Source: https://stackoverflow.com/questions/46316259/timer-countdown-angular-2
*/

const tick: any = 1000;

@Injectable()
export class RealTimeClockProvider {
counter: any = Date.now() / 1000;

  getEpochTime() {
    return Rx.Observable.timer(0, tick)
      .take(this.counter)
      .map(() => ++this.counter);
  }
}
