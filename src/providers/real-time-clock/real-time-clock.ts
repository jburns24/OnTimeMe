import { Injectable } from '@angular/core';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/do';
import Rx from "rxjs/Rx";

/* Important: you must share the observable with the other observers.
 * You can do this by setting and invoking the method:
 *   observable = <Rx.Observable>.share().
 * If not, then the seconds will be passed to one observer at a time,
 * and the next value that will be sent back will be minus the number of 
 * observers (or subscribers).
 */

const tick: any = 1000;

@Injectable()
export class RealTimeClockProvider {
counter: any = Date.now() / 1000;

  getEpochTime() {
    this.updateTime();
    return Rx.Observable.timer(0, tick)
      .take(this.counter)
      .map(() => ++this.counter);
  }

  updateTime() {
    this.counter = Date.now() / 1000;
  }
}
