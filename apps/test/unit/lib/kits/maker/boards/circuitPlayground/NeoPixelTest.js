/** @file Tests for our johnny-five Led.RGB wrapper */
import five from '@code-dot-org/johnny-five';

import NeoPixel from '@cdo/apps/lib/kits/maker/boards/circuitPlayground/NeoPixel';



describe('NeoPixel', function () {
  beforeEach(() => {
    // We stub five.Led.RGB's superclass to avoid calling any johnny-five
    // logic that requires a board.
    jest.spyOn(five.Board, 'Component').mockClear().mockImplementation();
  });

  afterEach(() => {
    five.Board.Component.mockRestore();
  });

  it('is a five.Led.RGB', () => {
    const led = new NeoPixel({
      controller: makeStubController(),
    });
    expect(led).toBeInstanceOf(five.Led.RGB);
  });

  describe('on()', () => {
    let led;

    beforeEach(() => {
      jest.spyOn(five.Led.RGB.prototype, 'on').mockClear();
      jest.spyOn(five.Led.RGB.prototype, 'stop').mockClear();
      led = new NeoPixel({
        controller: makeStubController(),
      });
    });

    afterEach(() => {
      five.Led.RGB.prototype.stop.mockRestore();
      five.Led.RGB.prototype.on.mockRestore();
    });

    it(`calls the parent on() implementation`, () => {
      five.Led.RGB.prototype.on.mockReset();
      led.on();
      expect(five.Led.RGB.prototype.on).toHaveBeenCalledTimes(1);
    });

    it(`calls stop() on the led to end any animations`, () => {
      five.Led.RGB.prototype.stop.mockReset();
      led.on();
      expect(five.Led.RGB.prototype.stop).toHaveBeenCalledTimes(1);
    });
  });

  describe('off()', () => {
    let led;

    beforeEach(() => {
      jest.spyOn(five.Led.RGB.prototype, 'off').mockClear();
      jest.spyOn(five.Led.RGB.prototype, 'stop').mockClear();
      led = new NeoPixel({
        controller: makeStubController(),
      });
    });

    afterEach(() => {
      five.Led.RGB.prototype.stop.mockRestore();
      five.Led.RGB.prototype.off.mockRestore();
    });

    it(`calls the parent off() implementation`, () => {
      five.Led.RGB.prototype.off.mockReset();
      led.off();
      expect(five.Led.RGB.prototype.off).toHaveBeenCalled();
    });

    it(`calls stop() on the led to end any animations`, () => {
      five.Led.RGB.prototype.stop.mockReset();
      led.off();
      expect(five.Led.RGB.prototype.stop).toHaveBeenCalledTimes(1);
    });
  });

  describe('blink()', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      led = new NeoPixel({
        controller: makeStubController(),
      });
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

  describe('color() valid arguments', () => {
    let led;

    // The tests are a little redundant with similar tests in johnny-five
    // (the color method is just a pass-through) but I left these in because
    // we particularly care about this behavior in Maker Toolkit.
    // Note: The Mozilla color value documentation was very
    // helpful when writing these tests:
    // https://developer.mozilla.org/en-US/docs/Web/CSS/color_value

    beforeEach(() => {
      led = new NeoPixel({
        controller: makeStubController(),
      });
    });

    it('hexadecimal color "#306090"', () => {
      led.color('#306090');
      expect(led.color()).toEqual({
        red: 0x30,
        green: 0x60,
        blue: 0x90,
      });
    });

    it('CSS1 color keywords "lime"', () => {
      led.color('lime');
      expect(led.color()).toEqual({
        red: 0x00,
        green: 0xff,
        blue: 0x00,
      });
    });

    it('CSS2 color keywords "orange"', () => {
      led.color('orange');
      expect(led.color()).toEqual({
        red: 0xff,
        green: 0xa5,
        blue: 0x00,
      });
    });

    it('CSS3 color keywords "chocolate"', () => {
      led.color('chocolate');
      expect(led.color()).toEqual({
        red: 0xd2,
        green: 0x69,
        blue: 0x1e,
      });
    });

    it('CSS4 color keywords "rebeccapurple"', () => {
      // See: https://codepen.io/trezy/post/honoring-a-great-man
      led.color('rebeccapurple');
      expect(led.color()).toEqual({
        red: 0x66,
        green: 0x33,
        blue: 0x99,
      });
    });

    it('CSS functional notation "rgb(30, 60, 90)"', () => {
      led.color('rgb(30, 60, 90)');
      expect(led.color()).toEqual({
        red: 30,
        green: 60,
        blue: 90,
      });
    });

    it('CSS functional notation "rgba(30, 60, 90, 0.5)"', () => {
      led.color('rgba(30, 60, 90, 0.5)');
      expect(led.color()).toEqual({
        red: 15,
        green: 30,
        blue: 45,
      });
    });

    it('CSS4 functional notation "rgb(30, 60, 90, 0.5)"', () => {
      led.color('rgb(30, 60, 90, 0.5)');
      expect(led.color()).toEqual({
        red: 15,
        green: 30,
        blue: 45,
      });
    });

    it('CSS4 functional notation "rgba(30, 60, 90)"', () => {
      led.color('rgba(30, 60, 90)');
      expect(led.color()).toEqual({
        red: 30,
        green: 60,
        blue: 90,
      });
    });

    it('Array of color values [30, 60, 90]', () => {
      led.color([30, 60, 90]);
      expect(led.color()).toEqual({
        red: 30,
        green: 60,
        blue: 90,
      });
    });

    it('Color object {red: 30, green: 60, blue: 90}', () => {
      led.color({red: 30, green: 60, blue: 90});
      expect(led.color()).toEqual({
        red: 30,
        green: 60,
        blue: 90,
      });
    });

    it('Separate color arguments (30, 60, 90)', () => {
      led.color(30, 60, 90);
      expect(led.color()).toEqual({
        red: 30,
        green: 60,
        blue: 90,
      });
    });
  });
});

function makeStubController() {
  return {
    initialize: {
      value: () => {},
    },
    write: {
      writable: true,
      value: () => {},
    },
  };
}
