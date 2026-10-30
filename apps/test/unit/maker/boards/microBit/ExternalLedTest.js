import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import ExternalLed from '@cdo/apps/maker/boards/microBit/ExternalLed';
import {MBFirmataClientStub} from '@cdo/apps/maker/util/makeStubBoard';

import {expect} from '../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

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
      setDigitalOutputSpy = sinon.spy(boardClient, 'setDigitalOutput');
    });

    afterAll(() => {
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
    let boardClient = new MBFirmataClientStub();
    let setDigitalOutputSpy, onSpy, offSpy;

    beforeAll(() => {
      led = new ExternalLed({
        board: boardClient,
        pin: 0,
        isOn: false,
      });
      setDigitalOutputSpy = sinon.spy(boardClient, 'setDigitalOutput');
      onSpy = sinon.spy(led, 'on');
      offSpy = sinon.spy(led, 'off');
    });
    afterAll(() => {
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
    let boardClient = new MBFirmataClientStub();

    beforeAll(() => {
      led = new ExternalLed({
        board: boardClient,
        pin: 0,
        isOn: false,
      });
      clock = sinon.useFakeTimers();
      sinon.spy(led, 'setDigitalOutputOn');
      sinon.spy(led, 'setDigitalOutputOff');
    });

    afterAll(() => {
      clock.restore();
      sinon.restore();
    });

    it(`calls toggle_ every set interval`, () => {
      led.blink(100);
      expect(led.setDigitalOutputOff).to.have.been.calledOnce;
      clock.tick(100);
      expect(led.setDigitalOutputOn).to.have.been.calledOnce;
      clock.tick(100);
      expect(led.setDigitalOutputOff).to.have.been.calledTwice;
      clock.tick(100);
      expect(led.setDigitalOutputOn).to.have.been.calledTwice;
    });
  });
});
