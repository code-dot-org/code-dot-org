import {assert} from '../util/deprecatedChai';

describe('Observer', function() {
  var Observer = require('@cdo/apps/Observer');
  var ObservableEventDEPRECATED = require('@cdo/apps/ObservableEventDEPRECATED');
  var observer, eventA, eventB, log, funcX, funcY;

  beforeEach(function() {
    observer = new Observer();
    eventA = new ObservableEventDEPRECATED();
    eventB = new ObservableEventDEPRECATED();
    log = '';
    funcX = function() {
      log += 'X';
    };
    funcY = function() {
      log += 'Y';
    };
  });

  describe('Registration and call ordering', function() {
    it('calls registered functions in order of registration', function() {
      observer.observe(eventA, funcX);
      observer.observe(eventA, funcX);
      observer.observe(eventA, funcY);
      observer.observe(eventA, funcX);
      observer.observe(eventA, funcY);

      eventA.notifyObservers();

      assert(log === 'XXYXY');
    });

    it('does not share functions between events', function() {
      observer.observe(eventA, funcX);
      observer.observe(eventB, funcY);

      eventA.notifyObservers();

      assert(log === 'X');
    });

    it('can be fired multiple times', function() {
      observer.observe(eventA, funcX);
      observer.observe(eventA, funcX);
      observer.observe(eventA, funcY);

      eventA.notifyObservers();

      assert(log === 'XXY');

      eventA.notifyObservers();

      assert(log === 'XXYXXY');
    });
  });

  describe('Keys and removal', function() {
    it('can unregister from all events at once', function() {
      observer.observe(eventA, funcX);
      observer.observe(eventA, funcY);
      observer.observe(eventB, funcX);

      eventA.notifyObservers();
      assert(log === 'XY', 'Event A received');

      eventB.notifyObservers();
      assert(log === 'XYX', 'Event B received');

      observer.unobserveAll();
      eventA.notifyObservers();
      assert(log === 'XYX', 'No change');

      eventB.notifyObservers();
      assert(log === 'XYX', 'No change');
    });

    it('can safely unregister when original references to events are lost', function() {
      observer.observe(eventA, funcX);

      eventA.notifyObservers();
      assert(log === 'X', 'Event A received');

      eventA = null;

      // Might be obvious, but we can do this safely because the observer
      // still has an internal reference to the event.
      observer.unobserveAll();
    });
  });

  it('respects binding `this` to the function passed into register', function() {
    var clientA = {log: ''};
    var clientB = {log: ''};
    var funcUsesThis = function() {
      this.log += 'Z';
      this.that = this;
    };

    observer.observe(eventA, funcUsesThis.bind(clientA));
    observer.observe(eventA, funcUsesThis.bind(clientB));
    eventA.notifyObservers();

    assert(clientA.log === 'Z');
    assert(clientA.that === clientA);
    assert(clientB.log === 'Z');
    assert(clientB.that === clientB);
  });

  it('passes arguments through to observers', function() {
    var funcWithArg = function(note) {
      log += note;
    };

    observer.observe(eventA, funcX);
    observer.observe(eventA, funcWithArg);

    eventA.notifyObservers('W');

    assert(log === 'XW');
  });
});
