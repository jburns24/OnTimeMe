import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the DateTimePipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'dateTimePipe',
})

//  Acceptable args for this pipe are
//  date: <true|false>
//  time: <true|false>
//
//  Regex Breakdown
//  Group 1:  Day of Week
//  Group 2:  Month (abbreviated)
//  Group 3:  Day of Month
//  Group 4:  Year
//  Group 5:  Time (24-hour)
//  Group 6:  TimeZone **This could group could be made better if we want to expand this**
export class DateTimePipe implements PipeTransform {
  transform(value: string, args?) {
    var resultString = "";
    var date = new Date(Date.parse(value)); 
    var regexDateTime = new RegExp("^([a-zA-Z]{3}) (\w{3}) (\d{2}) (\d{4}) ([0-9:]{8}) (.+)");
    var matchArray;
    if ((matchArray = regexDateTime.exec(date.toString())) !== null) {
        args.date ? resultString += matchArray[1] + " " + matchArray[3] + " " + matchArray[3] + " " : true;
        args.time ? resultString += matchArray[4] :true;
    }
    else {
        console.log("Date piped was invalid");
    }
    return resultString;
  }
}
