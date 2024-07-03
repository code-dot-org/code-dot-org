import ExternalLed from '@cdo/apps/lib/kits/maker/boards/microBit/ExternalLed';
import {MBFirmataClientStub} from '@cdo/apps/lib/kits/maker/util/makeStubBoard';



describe('ExternalLed', function () {
  describe('on() and off()', () => {
    let led;
    let boardClient = new MBFirmataClientStub();
    let setDigitalOutputSpy;

    beforeAll(() => {
      led = new ExternalLed({
        board: boardClient,
        pin: 0,
        isOn: false,
      });
      setDigitalOutputSpy = jest.spyOn(boardClient, 'setDigitalOutput').mockClear();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it(`calls the on() implementation`, () => {
      led.on();
      expect(setDigitalOutputSpy).toHaveBeenCalledTimes(1);
      expect(setDigitalOutputSpy).toHaveBeenCalledWith(0, 1);
    });

    it(`calls the off() implementation`, () => {
      led.off();
      expect(setDigitalOutputSpy).toHaveBeenCalledTimes(2);
      expect(setDigitalOutputSpy).toHaveBeenCalledWith(0, 0);
    });
  });

  describe('toggle()', () => {
    let led;
    let boardClient = new MBFirmataClientStub();
    let setDigitalOutputSpy, onSpy, offSpy;

    beforeAll(() => {
      led = new ExternalLed({
        board: boardClient,
        pin: 0,
        isOn: false,
      });
      setDigitalOutputSpy = jest.spyOn(boardClient, 'setDigitalOutput').mockClear();
      onSpy = jest.spyOn(led, 'on').mockClear();
      offSpy = jest.spyOn(led, 'off').mockClear();
    });
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it(`if LED is off, toggle triggers the led on`, () => {
      led.off();
      expect(setDigitalOutputSpy).not.toHaveBeenCalledWith(0, 1);
      led.toggle();
      expect(setDigitalOutputSpy).toHaveBeenCalledWith(0, 1);
      expect(onSpy).toHaveBeenCalledTimes(1);
    });

    it(`if LED is on, toggle triggers the led off`, () => {
      expect(setDigitalOutputSpy).toHaveBeenCalledWith(0, 0);
      led.on();
      expect(setDigitalOutputSpy).toHaveBeenCalledWith(0, 1);
      led.toggle();
      expect(offSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('blink()', () => {
    let boardClient = new MBFirmataClientStub();

    beforeAll(() => {
      led = new ExternalLed({
        board: boardClient,
        pin: 0,
        isOn: false,
      });
      jest.useFakeTimers();
      jest.spyOn(led, 'setDigitalOutputOn').mockClear();
      jest.spyOn(led, 'setDigitalOutputOff').mockClear();
    });

    afterAll(() => {
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    it(`calls toggle_ every set interval`, () => {
      led.blink(100);
      expect(led.setDigitalOutputOff).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(100);
      expect(led.setDigitalOutputOn).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(100);
      expect(led.setDigitalOutputOff).toHaveBeenCalledTimes(2);
      jest.advanceTimersByTime(100);
      expect(led.setDigitalOutputOn).toHaveBeenCalledTimes(2);
    });
  });
});
