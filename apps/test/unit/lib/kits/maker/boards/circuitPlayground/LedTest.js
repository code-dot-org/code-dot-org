/** @file Tests for our johnny-five Led wrapper */
import {expect} from '../../../../../../util/reconfiguredChai';
import five from '@code-dot-org/johnny-five';
import {makeCPBoardStub} from '@cdo/apps/lib/kits/maker/util/makeStubBoard';
import Led from '@cdo/apps/lib/kits/maker/boards/circuitPlayground/Led';

describe('Led', function () {
  it('is a five.Led', () => {
    const led = newTestLed();
    expect(led).to.be.an.instanceOf(five.Led);
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
      expect(five.Led.prototype.on).to.have.been.calledOnce;
    });

    it(`calls stop() on the led to end any animations`, () => {
      led.on();
      expect(five.Led.prototype.stop).to.have.been.calledOnce;
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
      expect(five.Led.prototype.stop).to.have.been.calledOnce;
    });

    it(`calls the parent off() implementation`, () => {
      led.off();
      expect(five.Led.prototype.off).to.have.been.called;
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
      expect(led.stop).to.have.been.calledOnce;

      // Pass some time and make sure it doesn't happen again
      led.stop.mockReset();
      jest.advanceTimersByTime(100);
      expect(led.toggle).to.have.been.calledOnce;
      expect(led.stop).not.to.have.been.called;
      jest.advanceTimersByTime(100);
      expect(led.toggle).to.have.been.calledTwice;
      expect(led.stop).not.to.have.been.called;
      jest.advanceTimersByTime(100);
      expect(led.toggle).to.have.been.calledThrice;
      expect(led.stop).not.to.have.been.called;
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
