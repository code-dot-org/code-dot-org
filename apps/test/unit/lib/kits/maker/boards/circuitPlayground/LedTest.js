/** @file Tests for our johnny-five Led wrapper */
import {expect} from '../../../../../../util/deprecatedChai';
import sinon from 'sinon';
import five from '@code-dot-org/johnny-five';
import {makeStubBoard} from '../makeStubBoard';
import Led from '@cdo/apps/lib/kits/maker/boards/circuitPlayground/Led';

describe('Led', function() {
  it('is a five.Led', () => {
    const led = newTestLed();
    expect(led).to.be.an.instanceOf(five.Led);
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
      led = newTestLed();
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
});

function newTestLed() {
  return new Led({
    controller: makeStubController(),
    board: makeStubBoard()
  });
}

function makeStubController() {
  return {
    initialize: {
      value: () => {}
    },
    write: {
      value: () => {}
    },
    update: {
      value: () => {}
    }
  };
}
