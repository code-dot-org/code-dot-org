/** @file Test the TouchSensor maker component which wraps Touchpad */
import {expect} from '../../../../../../util/deprecatedChai';
import sinon from 'sinon';
import {EventEmitter} from 'events'; // provided by webpack's node-libs-browser
import TouchSensor from '@cdo/apps/lib/kits/maker/boards/circuitPlayground/TouchSensor';

const DOWN = 'down';
const HOLD = 'hold';
const UP = 'up';

describe('TouchSensor', function() {
  let fakeTouchPad, touchSensor, spy;

  beforeEach(function() {
    fakeTouchPad = new FakeTouchPad();
    touchSensor = new TouchSensor(0, fakeTouchPad);
    spy = sinon.spy();
  });

  it('forwards events for its assigned pin', function() {
    touchSensor.on(DOWN, spy);
    expect(spy).not.to.have.been.called;

    fakeTouchPad.down(0);
    expect(spy).to.have.been.calledOnce;
  });

  it('does not forward events from other pins', function() {
    touchSensor.on(DOWN, spy);
    expect(spy).not.to.have.been.called;

    fakeTouchPad.down(1);
    expect(spy).not.to.have.been.called;
  });

  it('forwards down events', function() {
    touchSensor.on(DOWN, spy);
    expect(spy).not.to.have.been.called;

    fakeTouchPad.down(0);
    expect(spy).to.have.been.calledOnce;
  });

  it('forwards up events', function() {
    touchSensor.on(UP, spy);
    expect(spy).not.to.have.been.called;

    fakeTouchPad.up(0);
    expect(spy).to.have.been.calledOnce;
  });

  it('does not forward hold events', function() {
    touchSensor.on(HOLD, spy);
    expect(spy).not.to.have.been.called;

    fakeTouchPad.hold(0);
    expect(spy).not.to.have.been.called;
  });

  it('removes listeners on stop() (e.g. reset)', function() {
    // Add an initial listener
    touchSensor.on(DOWN, spy);
    expect(spy).not.to.have.been.called;

    // Check that the listener is working
    fakeTouchPad.down(0);
    expect(spy).to.have.been.calledOnce;

    // Reset component
    touchSensor.stop();

    // Listener was removed in reset, so event is not forwarded.
    spy.resetHistory();
    fakeTouchPad.down(0);
    expect(spy).not.to.have.been.called;

    // Now we can add a new listener
    touchSensor.on(DOWN, spy);
    expect(spy).not.to.have.been.called;

    // And the new listener gets called
    fakeTouchPad.down(0);
    expect(spy).to.have.been.calledOnce;
  });
});

class FakeTouchPad extends EventEmitter {
  constructor() {
    super();
  }

  down(pin) {
    this.emit(DOWN, {type: DOWN, which: [pin]});
  }

  up(pin) {
    this.emit(UP, {type: UP, which: [pin]});
  }

  // 'hold' is a real event type emitted by playground-io's TouchSensor.
  hold(pin) {
    this.emit(HOLD, {type: HOLD, which: [pin]});
  }
}
