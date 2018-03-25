import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the HoursMinutesSecondsPipe pipe.
 * 
 * @source  https://www.youtube.com/watch?v=Z1g1iroNHK0
 */
@Pipe({
  name: 'hoursMinutesSeconds',
})
export class HoursMinutesSecondsPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: number, args?) {
    let minutes = Math.floor(value / 60);
    let hours = Math.floor(minutes / 60);
    let seconds = Math.floor(value % 60);

    let timeString ="";
    args.hours ? timeString += hours + " hrs " : true;
    args.minutes ? timeString += (minutes - (60 * hours))+ " mins " : true;
    args.seconds ? timeString += seconds + " secs " : true;

    return timeString;
  }
}
