import { async, TestBed, inject } from '@angular/core/testing';
import { RealTimeClockProvider } from '../../providers/real-time-clock/real-time-clock'

describe('Real Time Clock Test', () => {
    let clock: RealTimeClockProvider;


    beforeEach(() => { 
        clock = new RealTimeClockProvider(); 
    });

    it('should be created', () => {
        expect(clock instanceof RealTimeClockProvider).toBe(true);
    });

    it('should return number greater than zero',
    (done: DoneFn) => {
        clock.getEpochTime().subscribe(time => {
            expect(time > 0).toBe(true);
            done();
        });
    });

    it('should return the correct time',
    (done: DoneFn) => {
        let currentTime = Math.floor(Date.now() / 1000 / 60);
        clock.getEpochTime().subscribe(time => {
            let testTime = Math.floor(time / 60);
            // ensures the time is accurate within 1 second;
            expect(Math.abs(testTime - currentTime) <= 1 ).toBe(true);
            done();
        });
    });

});