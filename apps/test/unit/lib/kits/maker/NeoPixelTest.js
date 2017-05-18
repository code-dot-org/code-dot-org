/** @file Tests for our johnny-five Led.RGB wrapper */
import {expect} from '../../../../util/configuredChai';
import sinon from 'sinon';
import five from '@code-dot-org/johnny-five';
import NeoPixel, {PASS_THRU_PROPERTIES, PASS_THRU_METHODS} from '@cdo/apps/lib/kits/maker/NeoPixel';

describe('NeoPixel', function () {
  beforeEach(function () {
    // We stub five.Led.RGB's superclass to avoid calling any johnny-five
    // logic that requires a board.
    sinon.stub(five.Board, 'Component');
  });

  afterEach(function () {
    five.Board.Component.restore();
  });

  // Pass-through properties - just check that they exist.
  PASS_THRU_PROPERTIES.forEach(prop => {
    describe(prop, () => {
      it('property exists', () => {
        const led = new NeoPixel({
          controller: makeStubController()
        });
        expect(led).to.have.ownProperty(prop);
        expect(led[prop]).to.equal(led.rgb_[prop]);
      });
    });
  });

  // Pass-through methods - just check that they delegate.
  PASS_THRU_METHODS.forEach(fnName => {
    describe(`${fnName}()`, () => {
      let led, spy;

      beforeEach(() => {
        spy = sinon.stub(five.Led.RGB.prototype, fnName);
        led = new NeoPixel({
          controller: makeStubController()
        });
      });

      afterEach(() => {
        five.Led.RGB.prototype[fnName].restore();
      });

      it(`delegates method to RGB controller`, () => {
        const args = [Math.random(), Math.random(), Math.random()];
        led[fnName](...args);
        expect(spy).to.have.been.calledOnce.calledWith(...args);
      });
    });
  });

  describe('on()', () => {
    let led;

    beforeEach(() => {
      sinon.stub(five.Led.RGB.prototype, 'on');
      sinon.stub(five.Led.RGB.prototype, 'stop');
      led = new NeoPixel({
        controller: makeStubController()
      });
    });

    afterEach(() => {
      five.Led.RGB.prototype.stop.restore();
      five.Led.RGB.prototype.on.restore();
    });

    it(`calls the parent on() implementation`, () => {
      led.on();
      expect(five.Led.RGB.prototype.on).to.have.been.calledOnce;
    });

    it(`calls stop() on the led to end any animations`, () => {
      led.on();
      expect(five.Led.RGB.prototype.stop).to.have.been.calledOnce;
    });
  });

  describe('off()', () => {
    let led;

    beforeEach(() => {
      sinon.stub(five.Led.RGB.prototype, 'off');
      sinon.stub(five.Led.RGB.prototype, 'stop');
      led = new NeoPixel({
        controller: makeStubController()
      });
    });

    afterEach(() => {
      five.Led.RGB.prototype.stop.restore();
      five.Led.RGB.prototype.off.restore();
    });

    it(`calls stop() on the led to end any animations`, () => {
      led.off();
      expect(five.Led.RGB.prototype.stop).to.have.been.calledOnce;
    });

    it(`calls the parent off() implementation`, () => {
      led.off();
      expect(five.Led.RGB.prototype.off).to.have.been.called;
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
        blue: 0x90,
      });
    });

    it('CSS1 color keywords "lime"', () => {
      led.color('lime');
      expect(led.color()).to.deep.equal({
        red: 0x00,
        green: 0xff,
        blue: 0x00,
      });
    });

    it('CSS2 color keywords "orange"', () => {
      led.color('orange');
      expect(led.color()).to.deep.equal({
        red: 0xff,
        green: 0xa5,
        blue: 0x00,
      });
    });

    it('CSS3 color keywords "chocolate"', () => {
      led.color('chocolate');
      expect(led.color()).to.deep.equal({
        red: 0xd2,
        green: 0x69,
        blue: 0x1e,
      });
    });

    it('CSS4 color keywords "rebeccapurple"', () => {
      // See: https://codepen.io/trezy/post/honoring-a-great-man
      led.color('rebeccapurple');
      expect(led.color()).to.deep.equal({
        red: 0x66,
        green: 0x33,
        blue: 0x99,
      });
    });

    it('CSS functional notation "rgb(30, 60, 90)"', () => {
      led.color('rgb(30, 60, 90)');
      expect(led.color()).to.deep.equal({
        red: 30,
        green: 60,
        blue: 90,
      });
    });

    it('CSS functional notation "rgba(30, 60, 90, 0.5)"', () => {
      led.color('rgba(30, 60, 90, 0.5)');
      expect(led.color()).to.deep.equal({
        red: 15,
        green: 30,
        blue: 45,
      });
    });

    it('CSS4 functional notation "rgb(30, 60, 90, 0.5)"', () => {
      led.color('rgb(30, 60, 90, 0.5)');
      expect(led.color()).to.deep.equal({
        red: 15,
        green: 30,
        blue: 45,
      });
    });

    it('CSS4 functional notation "rgba(30, 60, 90)"', () => {
      led.color('rgba(30, 60, 90)');
      expect(led.color()).to.deep.equal({
        red: 30,
        green: 60,
        blue: 90,
      });
    });

    it('Array of color values [30, 60, 90]', () => {
      led.color([30, 60, 90]);
      expect(led.color()).to.deep.equal({
        red: 30,
        green: 60,
        blue: 90,
      });
    });

    it('Color object {red: 30, green: 60, blue: 90}', () => {
      led.color({red: 30, green: 60, blue: 90});
      expect(led.color()).to.deep.equal({
        red: 30,
        green: 60,
        blue: 90,
      });
    });

    it('Separate color arguments (30, 60, 90)', () => {
      led.color(30, 60, 90);
      expect(led.color()).to.deep.equal({
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
      value: () => {}
    },
    write: {
      writable: true,
      value: () => {}
    }
  };
}
