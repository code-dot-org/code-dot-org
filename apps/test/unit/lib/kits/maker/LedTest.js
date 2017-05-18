/** @file Tests for our johnny-five Led wrapper */
import {expect} from '../../../../util/configuredChai';
import sinon from 'sinon';
import five from '@code-dot-org/johnny-five';
import Led, {PASS_THRU_PROPERTIES, PASS_THRU_METHODS} from '@cdo/apps/lib/kits/maker/Led';

describe('Led', function () {
  beforeEach(function () {
    // We stub five.Led's superclass to avoid calling any johnny-five
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
        const led = new Led({
          controller: makeStubController()
        });
        expect(led).to.have.ownProperty(prop);
        expect(led[prop]).to.equal(led.led_[prop]);
      });
    });
  });

  // Pass-through methods - just check that they delegate.
  PASS_THRU_METHODS.forEach(fnName => {
    describe(`${fnName}()`, () => {
      let led, spy;

      beforeEach(() => {
        spy = sinon.stub(five.Led.prototype, fnName);
        led = new Led({
          controller: makeStubController()
        });
      });

      afterEach(() => {
        five.Led.prototype[fnName].restore();
      });

      it(`delegates method to five.Led controller`, () => {
        const args = [Math.random(), Math.random(), Math.random()];
        led[fnName](...args);
        expect(spy).to.have.been.calledOnce.calledWith(...args);
      });
    });
  });

  describe('on()', () => {
    let led;

    beforeEach(() => {
      sinon.stub(five.Led.prototype, 'on');
      sinon.stub(five.Led.prototype, 'stop');
      led = new Led({
        controller: makeStubController()
      });
    });

    afterEach(() => {
      five.Led.prototype.stop.restore();
      five.Led.prototype.on.restore();
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
      sinon.stub(five.Led.prototype, 'off');
      sinon.stub(five.Led.prototype, 'stop');
      led = new Led({
        controller: makeStubController()
      });
    });

    afterEach(() => {
      five.Led.prototype.stop.restore();
      five.Led.prototype.off.restore();
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
