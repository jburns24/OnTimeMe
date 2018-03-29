import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/timer'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/take'
import 'rxjs/add/operator/do'
/*
  Generated class for the RealTimeClockProvider provider.

  Source: https://stackoverflow.com/questions/46316259/timer-countdown-angular-2
*/
@Injectable()
export class RealTimeClockProvider {
  counter = Date.now() / 1000;
  tick = 1000;

  getEpochTime() {
    return Observable.timer(0, this.tick)
      .take(this.counter)
      .map(() => ++this.counter)
  }
}
