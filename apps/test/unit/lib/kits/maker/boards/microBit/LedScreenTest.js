import LedScreen from '@cdo/apps/lib/kits/maker/boards/microBit/LedScreen';
import {MBFirmataClientStub} from '@cdo/apps/lib/kits/maker/util/makeStubBoard';



describe('LedScreen', function () {
  describe('on() and off()', () => {
    let led;
    let boardClient = new MBFirmataClientStub();
    let displaySpy;
    let displayClearSpy;

    beforeAll(() => {
      led = new LedScreen({
        mb: boardClient,
      });
      displaySpy = jest.spyOn(boardClient, 'displayPlot').mockClear();
      displayClearSpy = jest.spyOn(boardClient, 'displayClear').mockClear();
    });
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it(`calls the parent on() implementation`, () => {
      led.on(1, 2, 155);
      expect(displaySpy).toHaveBeenCalledTimes(1);
      expect(displaySpy).toHaveBeenCalledWith(1, 2, 155);
    });

    it(`calls the parent off() implementation`, () => {
      led.off(1, 2);
      expect(displaySpy).toHaveBeenCalledTimes(2);
      expect(displaySpy).toHaveBeenCalledWith(1, 2, 0);
    });

    it(`clear() calls the parent implementation`, () => {
      led.clear();
      expect(displayClearSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('toggle()', () => {
    let led;
    let boardClient = new MBFirmataClientStub();
    let displaySpy;

    beforeAll(() => {
      led = new LedScreen({
        mb: boardClient,
      });
      displaySpy = jest.spyOn(boardClient, 'displayPlot').mockClear();
    });
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it(`if LED is off, toggle triggers the parent on`, () => {
      led.clear();
      led.toggle(1, 2, 155);
      expect(displaySpy).toHaveBeenCalledTimes(1);
      expect(displaySpy).toHaveBeenCalledWith(1, 2, 155);
    });

    it(`if LED is on, toggle triggers the parent off`, () => {
      led.clear();
      led.on(2, 3, 175);
      led.toggle(2, 3, 175);
      expect(displaySpy).toHaveBeenCalledWith(2, 3, 0);
    });

    it(`if toggle is triggered twice on the same LED, on and off are called`, () => {
      led.clear();
      led.toggle(1, 0, 200);
      expect(displaySpy).toHaveBeenCalledWith(1, 0, 200);
      led.toggle(1, 0, 200);
      expect(displaySpy).toHaveBeenCalledWith(1, 0, 0);
    });
  });

  describe('display()', () => {
    let led;
    let boardClient = new MBFirmataClientStub();
    let displaySpy;

    beforeAll(() => {
      led = new LedScreen({
        mb: boardClient,
      });
      displaySpy = jest.spyOn(boardClient, 'displayShow').mockClear();
    });
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('calls the parent displayShow', () => {
      let pixelArray = [
        [1, 0, 1, 0, 1],
        [0, 1, 0, 1, 0],
        [1, 0, 1, 0, 1],
        [0, 1, 0, 1, 0],
        [1, 0, 1, 0, 1],
      ];
      led.display(pixelArray);
      expect(displaySpy).toHaveBeenCalledTimes(1);
      expect(displaySpy).toHaveBeenCalledWith(false, pixelArray);
    });
  });

  describe('scrollString() and scrollNumber()', () => {
    let led;
    let boardClient = new MBFirmataClientStub();
    let scrollStringSpy;
    let scrollNumSpy;

    beforeAll(() => {
      led = new LedScreen({
        mb: boardClient,
      });
      scrollStringSpy = jest.spyOn(boardClient, 'scrollString').mockClear();
      scrollNumSpy = jest.spyOn(boardClient, 'scrollInteger').mockClear();
    });
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it(`calls the parent scrollString`, () => {
      led.scrollString('Test');
      expect(scrollStringSpy).toHaveBeenCalledTimes(1);
      expect(scrollStringSpy).toHaveBeenCalledWith('Test');
    });

    it(`calls the parent scrollNumber`, () => {
      led.scrollNumber(1234);
      expect(scrollNumSpy).toHaveBeenCalledTimes(1);
      expect(scrollNumSpy).toHaveBeenCalledWith(1234);
    });
  });
});
