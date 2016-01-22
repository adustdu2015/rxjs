var Rx = require('../../dist/cjs/Rx');
var RangeObservable = require('../../dist/cjs/observable/RangeObservable').RangeObservable;
var Observable = Rx.Observable;
var asap = Rx.Scheduler.asap;

describe('Observable.range', function () {
  it('should synchronously create a range of values by default', function () {
    var results = [];
    Observable.range(12, 4).subscribe(function (x) {
      results.push(x);
    });
    expect(results).toEqual([12, 13, 14, 15]);
  });

  it('should accept a scheduler', function (done) {
    var expected = [12, 13, 14, 15];
    spyOn(asap, 'schedule').and.callThrough();

    var source = Observable.range(12, 4, asap);

    expect(source.scheduler).toBe(asap);

    source.subscribe(function (x) {
      expect(asap.schedule).toHaveBeenCalled();
      var exp = expected.shift();
      expect(x).toBe(exp);
    }, function (x) {
      done.fail('should not be called');
    }, done);
  });
});

describe('RangeObservable', function () {
  describe('create', function () {
    it('should create a RangeObservable', function () {
      var observable = RangeObservable.create(12, 4);
      expect(observable instanceof RangeObservable).toBe(true);
    });

    it('should accept a scheduler', function () {
      var observable = RangeObservable.create(12, 4, asap);
      expect(observable.scheduler).toBe(asap);
    });
  });

  describe('dispatch', function () {
    it('should complete if index >= end', function () {
      var state = {
        subscriber: jasmine.createSpyObj(['next', 'error', 'complete']),
        index: 10,
        start: 0,
        end: 9
      };

      RangeObservable.dispatch(state);

      expect(state.subscriber.complete).toHaveBeenCalled();
      expect(state.subscriber.next).not.toHaveBeenCalled();
    });

    it('should next out a nother value and increment the index and start', function () {
      var state = {
        subscriber: jasmine.createSpyObj(['next', 'error', 'complete']),
        index: 1,
        start: 5,
        end: 9
      };

      var thisArg = {
        schedule: jasmine.createSpy('schedule')
      };

      RangeObservable.dispatch.call(thisArg, state);

      expect(state.subscriber.complete).not.toHaveBeenCalled();
      expect(state.subscriber.next).toHaveBeenCalledWith(5);
      expect(state.start).toBe(6);
      expect(state.index).toBe(2);
      expect(thisArg.schedule).toHaveBeenCalledWith(state);
    });
  });
});