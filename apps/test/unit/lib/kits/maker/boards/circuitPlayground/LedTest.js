/** @file Tests for our johnny-five Led wrapper */
import five from '@code-dot-org/johnny-five';

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
      jest.spyOn(five.Led.prototype, 'on').mockClear().mockImplementation();
      jest.spyOn(five.Led.prototype, 'stop').mockClear().mockImplementation();
      led = newTestLed();
    });

    afterEach(() => {
      five.Led.prototype.stop.mockRestore();
      five.Led.prototype.on.mockRestore();
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
      jest.spyOn(five.Led.prototype, 'off').mockClear().mockImplementation();
      jest.spyOn(five.Led.prototype, 'stop').mockClear().mockImplementation();
      led = newTestLed();
    });

    afterEach(() => {
      five.Led.prototype.stop.mockRestore();
      five.Led.prototype.off.mockRestore();
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
    beforeEach(() => {
      jest.useFakeTimers();
      led = newTestLed();
      jest.spyOn(led, 'stop').mockClear();
      jest.spyOn(led, 'toggle').mockClear();
    });

    afterEach(() => {
      led.toggle.mockRestore();
      led.stop.mockRestore();
      jest.useRealTimers();
    });

    it(`calls stop() only once when blink starts`, () => {
      led.stop.mockReset();
      led.blink(100);
      expect(led.stop).toHaveBeenCalledTimes(1);

      // Pass some time and make sure it doesn't happen again
      led.stop.mockReset();
      jest.advanceTimersByTime(100);
      expect(led.toggle).toHaveBeenCalledTimes(1);
      expect(led.stop).not.toHaveBeenCalled();
      jest.advanceTimersByTime(100);
      expect(led.toggle).toHaveBeenCalledTimes(2);
      expect(led.stop).not.toHaveBeenCalled();
      jest.advanceTimersByTime(100);
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
