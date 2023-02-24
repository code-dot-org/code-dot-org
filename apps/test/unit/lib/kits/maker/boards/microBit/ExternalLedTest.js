import {expect} from '../../../../../../util/reconfiguredChai';
import sinon from 'sinon';
import {MicrobitStubBoard} from '../makeStubBoard';
import ExternalLed from '@cdo/apps/lib/kits/maker/boards/microBit/ExternalLed';

describe('ExternalLed', function() {
  describe('on() and off()', () => {
    let led;
    let boardClient = new MicrobitStubBoard();
    let setDigitalOutputSpy;

    before(() => {
      led = new ExternalLed({
        board: boardClient,
        pin: 0,
        isOn: false
      });
      setDigitalOutputSpy = sinon.spy(boardClient, 'setDigitalOutput');
    });

    after(() => {
      sinon.restore();
    });

    it(`calls the on() implementation`, () => {
      led.on();
      expect(setDigitalOutputSpy).to.have.been.calledOnce;
      expect(setDigitalOutputSpy).to.have.been.calledWith(0, 1);
    });

    it(`calls the off() implementation`, () => {
      led.off();
      expect(setDigitalOutputSpy).to.have.been.calledTwice;
      expect(setDigitalOutputSpy).to.have.been.calledWith(0, 0);
    });
  });

  describe('toggle()', () => {
    let led;
    let boardClient = new MicrobitStubBoard();
    let setDigitalOutputSpy, onSpy, offSpy;

    before(() => {
      led = new ExternalLed({
        board: boardClient,
        pin: 0,
        isOn: false
      });
      setDigitalOutputSpy = sinon.spy(boardClient, 'setDigitalOutput');
      onSpy = sinon.spy(led, 'on');
      offSpy = sinon.spy(led, 'off');
    });
    after(() => {
      sinon.restore();
    });

    it(`if LED is off, toggle triggers the led on`, () => {
      led.off();
      expect(setDigitalOutputSpy).to.not.have.been.calledWith(0, 1);
      led.toggle();
      expect(setDigitalOutputSpy).to.have.been.calledWith(0, 1);
      expect(onSpy).to.have.been.calledOnce;
    });

    it(`if LED is on, toggle triggers the led off`, () => {
      expect(setDigitalOutputSpy).to.have.been.calledWith(0, 0);
      led.on();
      expect(setDigitalOutputSpy).to.have.been.calledWith(0, 1);
      led.toggle();
      expect(offSpy).to.have.been.calledTwice;
    });
  });

  describe('blink()', () => {
    let led, clock;
    let boardClient = new MicrobitStubBoard();

    before(() => {
      led = new ExternalLed({
        board: boardClient,
        pin: 0,
        isOn: false
      });
      clock = sinon.useFakeTimers();
      sinon.spy(led, 'toggle_');
    });

    after(() => {
      clock.restore();
      sinon.restore();
    });

    it(`calls toggle_ every set interval`, () => {
      led.blink(100);
      clock.tick(100);
      expect(led.toggle_).to.have.been.calledOnce;
      clock.tick(100);
      expect(led.toggle_).to.have.been.calledTwice;
      clock.tick(100);
      expect(led.toggle_).to.have.been.calledThrice;
    });
  });
});
