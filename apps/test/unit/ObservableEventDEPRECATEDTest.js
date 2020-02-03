import {assert} from '../util/deprecatedChai';

describe('ObservableEventDEPRECATED', function() {
  var ObservableEventDEPRECATED = require('@cdo/apps/ObservableEventDEPRECATED');
  var eventA, eventB, log, funcX, funcY;

  beforeEach(function() {
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
      eventA.register(funcX);
      eventA.register(funcX);
      eventA.register(funcY);
      eventA.register(funcX);
      eventA.register(funcY);

      eventA.notifyObservers();

      assert(log === 'XXYXY');
    });

    it('does not share functions between events', function() {
      eventA.register(funcX);
      eventB.register(funcY);

      eventA.notifyObservers();

      assert(log === 'X');
    });

    it('can be fired multiple times', function() {
      eventA.register(funcX);
      eventA.register(funcX);
      eventA.register(funcY);

      eventA.notifyObservers();

      assert(log === 'XXY');

      eventA.notifyObservers();

      assert(log === 'XXYXXY');
    });
  });

  describe('Keys and removal', function() {
    var key1, key2, key3;

    beforeEach(function() {
      key1 = eventA.register(funcX);
      key2 = eventA.register(funcY);
      key3 = eventA.register(funcX);
    });

    it('returns a frozen key', function() {
      assert(Object.isFrozen(key2));

      // Modifying a frozen key will either fail silently,
      // or will throw an exception.
      var threwError = false;
      try {
        key2.newAttribute = 'someValue';
      } catch (e) {
        threwError = true;
      }
      assert(
        threwError || key2.newAttribute === undefined,
        'Returned keys must be frozen.'
      );
    });

    it('can be unregistered with given key', function() {
      eventA.unregister(key1);
      eventA.notifyObservers();
      assert(log === 'YX');
    });

    it('creates unique keys for different entries of the same function', function() {
      eventA.unregister(key3);
      eventA.notifyObservers();
      assert(log === 'XY');
    });
  });

  it('respects binding `this` to the function passed into register', function() {
    var observerA = {log: ''};
    var observerB = {log: ''};
    var funcUsesThis = function() {
      this.log += 'Z';
      this.that = this;
    };

    eventA.register(funcUsesThis.bind(observerA));
    eventA.register(funcUsesThis.bind(observerB));
    eventA.notifyObservers();

    assert(observerA.log === 'Z');
    assert(observerA.that === observerA);
    assert(observerB.log === 'Z');
    assert(observerB.that === observerB);
  });

  it('passes arguments through to observers', function() {
    var funcWithArg = function(note) {
      log += note;
    };

    eventA.register(funcX);
    eventA.register(funcWithArg);

    eventA.notifyObservers('W');

    assert(log === 'XW');
  });
});
