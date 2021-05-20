/** @file Tests for our johnny-five Led.RGB wrapper */
import {expect} from '../../../../../../util/deprecatedChai';
import sinon from 'sinon';
import five from '@code-dot-org/johnny-five';
import NeoPixel from '@cdo/apps/lib/kits/maker/boards/circuitPlayground/NeoPixel';

describe('NeoPixel', function() {
  beforeEach(() => {
    // We stub five.Led.RGB's superclass to avoid calling any johnny-five
    // logic that requires a board.
    sinon.stub(five.Board, 'Component');
  });

  afterEach(() => {
    five.Board.Component.restore();
  });

  it('is a five.Led.RGB', () => {
    const led = new NeoPixel({
      controller: makeStubController()
    });
    expect(led).to.be.an.instanceOf(five.Led.RGB);
  });

  describe('on()', () => {
    let led;

    beforeEach(() => {
      sinon.spy(five.Led.RGB.prototype, 'on');
      sinon.spy(five.Led.RGB.prototype, 'stop');
      led = new NeoPixel({
        controller: makeStubController()
      });
    });

    afterEach(() => {
      five.Led.RGB.prototype.stop.restore();
      five.Led.RGB.prototype.on.restore();
    });

    it(`calls the parent on() implementation`, () => {
      five.Led.RGB.prototype.on.resetHistory();
      led.on();
      expect(five.Led.RGB.prototype.on).to.have.been.calledOnce;
    });

    it(`calls stop() on the led to end any animations`, () => {
      five.Led.RGB.prototype.stop.resetHistory();
      led.on();
      expect(five.Led.RGB.prototype.stop).to.have.been.calledOnce;
    });
  });

  describe('off()', () => {
    let led;

    beforeEach(() => {
      sinon.spy(five.Led.RGB.prototype, 'off');
      sinon.spy(five.Led.RGB.prototype, 'stop');
      led = new NeoPixel({
        controller: makeStubController()
      });
    });

    afterEach(() => {
      five.Led.RGB.prototype.stop.restore();
      five.Led.RGB.prototype.off.restore();
    });

    it(`calls the parent off() implementation`, () => {
      five.Led.RGB.prototype.off.resetHistory();
      led.off();
      expect(five.Led.RGB.prototype.off).to.have.been.called;
    });

    it(`calls stop() on the led to end any animations`, () => {
      five.Led.RGB.prototype.stop.resetHistory();
      led.off();
      expect(five.Led.RGB.prototype.stop).to.have.been.calledOnce;
    });
  });

  describe('blink()', () => {
    let led, clock;

    beforeEach(() => {
      clock = sinon.useFakeTimers();
      led = new NeoPixel({
        controller: makeStubController()
      });
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
      expect(led.stop).to.have.been.calledOnce;

      // Pass some time and make sure it doesn't happen again
      led.stop.resetHistory();
      clock.tick(100);
      expect(led.toggle).to.have.been.calledOnce;
      expect(led.stop).not.to.have.been.called;
      clock.tick(100);
      expect(led.toggle).to.have.been.calledTwice;
      expect(led.stop).not.to.have.been.called;
      clock.tick(100);
      expect(led.toggle).to.have.been.calledThrice;
      expect(led.stop).not.to.have.been.called;
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
        controller: makeStubController()
      });
    });

    it('hexadecimal color "#306090"', () => {
      led.color('#306090');
      expect(led.color()).to.deep.equal({
        red: 0x30,
        green: 0x60,
        blue: 0x90
      });
    });

    it('CSS1 color keywords "lime"', () => {
      led.color('lime');
      expect(led.color()).to.deep.equal({
        red: 0x00,
        green: 0xff,
        blue: 0x00
      });
    });

    it('CSS2 color keywords "orange"', () => {
      led.color('orange');
      expect(led.color()).to.deep.equal({
        red: 0xff,
        green: 0xa5,
        blue: 0x00
      });
    });

    it('CSS3 color keywords "chocolate"', () => {
      led.color('chocolate');
      expect(led.color()).to.deep.equal({
        red: 0xd2,
        green: 0x69,
        blue: 0x1e
      });
    });

    it('CSS4 color keywords "rebeccapurple"', () => {
      // See: https://codepen.io/trezy/post/honoring-a-great-man
      led.color('rebeccapurple');
      expect(led.color()).to.deep.equal({
        red: 0x66,
        green: 0x33,
        blue: 0x99
      });
    });

    it('CSS functional notation "rgb(30, 60, 90)"', () => {
      led.color('rgb(30, 60, 90)');
      expect(led.color()).to.deep.equal({
        red: 30,
        green: 60,
        blue: 90
      });
    });

    it('CSS functional notation "rgba(30, 60, 90, 0.5)"', () => {
      led.color('rgba(30, 60, 90, 0.5)');
      expect(led.color()).to.deep.equal({
        red: 15,
        green: 30,
        blue: 45
      });
    });

    it('CSS4 functional notation "rgb(30, 60, 90, 0.5)"', () => {
      led.color('rgb(30, 60, 90, 0.5)');
      expect(led.color()).to.deep.equal({
        red: 15,
        green: 30,
        blue: 45
      });
    });

    it('CSS4 functional notation "rgba(30, 60, 90)"', () => {
      led.color('rgba(30, 60, 90)');
      expect(led.color()).to.deep.equal({
        red: 30,
        green: 60,
        blue: 90
      });
    });

    it('Array of color values [30, 60, 90]', () => {
      led.color([30, 60, 90]);
      expect(led.color()).to.deep.equal({
        red: 30,
        green: 60,
        blue: 90
      });
    });

    it('Color object {red: 30, green: 60, blue: 90}', () => {
      led.color({red: 30, green: 60, blue: 90});
      expect(led.color()).to.deep.equal({
        red: 30,
        green: 60,
        blue: 90
      });
    });

    it('Separate color arguments (30, 60, 90)', () => {
      led.color(30, 60, 90);
      expect(led.color()).to.deep.equal({
        red: 30,
        green: 60,
        blue: 90
      });
    });
  });
});

function makeStubController() {
  return {
    initialize: {
      value: () => {}
    },
    write: {
      writable: true,
      value: () => {}
    }
  };
}
