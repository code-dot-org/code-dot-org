/** @file Tests for our johnny-five Led wrapper */
import five from '@code-dot-org/johnny-five';
import sinon from 'sinon';

import Led from '@cdo/apps/lib/kits/maker/boards/circuitPlayground/Led';
import {makeCPBoardStub} from '@cdo/apps/lib/kits/maker/util/makeStubBoard';



describe('Led', function () {
  it('is a five.Led', () => {
    const led = newTestLed();
    expect(led).toBeInstanceOf(five.Led);
  });

  describe('on()', () => {
    let led;

    beforeEach(() => {
      sinon.stub(five.Led.prototype, 'on');
      sinon.stub(five.Led.prototype, 'stop');
      led = newTestLed();
    });

    afterEach(() => {
      five.Led.prototype.stop.restore();
      five.Led.prototype.on.restore();
    });

    it(`calls the parent on() implementation`, () => {
      led.on();
      expect(five.Led.prototype.on).toHaveBeenCalledTimes(1);
    });

    it(`calls stop() on the led to end any animations`, () => {
      led.on();
      expect(five.Led.prototype.stop).toHaveBeenCalledTimes(1);
    });
  });

  describe('off()', () => {
    let led;

    beforeEach(() => {
      sinon.stub(five.Led.prototype, 'off');
      sinon.stub(five.Led.prototype, 'stop');
      led = newTestLed();
    });

    afterEach(() => {
      five.Led.prototype.stop.restore();
      five.Led.prototype.off.restore();
    });

    it(`calls stop() on the led to end any animations`, () => {
      led.off();
      expect(five.Led.prototype.stop).toHaveBeenCalledTimes(1);
    });

    it(`calls the parent off() implementation`, () => {
      led.off();
      expect(five.Led.prototype.off).toHaveBeenCalled();
    });
  });

  describe('blink()', () => {
    let led, clock;

    beforeEach(() => {
      clock = sinon.useFakeTimers();
      led = newTestLed();
      sinon.spy(led, 'stop');
      sinon.spy(led, 'toggle');
    });

    afterEach(() => {
      led.toggle.restore();
      led.stop.restore();
      clock.restore();
    });

    it(`calls stop() only once when blink starts`, () => {
      led.stop.resetHistory();
      led.blink(100);
      expect(led.stop).toHaveBeenCalledTimes(1);

      // Pass some time and make sure it doesn't happen again
      led.stop.resetHistory();
      clock.tick(100);
      expect(led.toggle).toHaveBeenCalledTimes(1);
      expect(led.stop).not.toHaveBeenCalled();
      clock.tick(100);
      expect(led.toggle).toHaveBeenCalledTimes(2);
      expect(led.stop).not.toHaveBeenCalled();
      clock.tick(100);
      expect(led.toggle).toHaveBeenCalledTimes(3);
      expect(led.stop).not.toHaveBeenCalled();
    });
  });
});

function newTestLed() {
  return new Led({
    controller: makeStubController(),
    board: makeCPBoardStub(),
  });
}

function makeStubController() {
  return {
    initialize: {
      value: () => {},
    },
    write: {
      value: () => {},
    },
    update: {
      value: () => {},
    },
  };
}
