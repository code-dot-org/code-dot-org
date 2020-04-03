/** @file Tests for our johnny-five Led wrapper */
import {expect} from '../../../../util/deprecatedChai';
import sinon from 'sinon';
import {MicrobitStubBoard} from './makeStubBoard';
import LedMatrix from '@cdo/apps/lib/kits/maker/LedMatrix';

describe('LedMatrix', function() {
  describe('on() and off()', () => {
    let led;
    let boardClient = new MicrobitStubBoard();
    let displaySpy;
    let displayClearSpy;

    before(() => {
      led = new LedMatrix({
        mb: boardClient
      });
      displaySpy = sinon.spy(boardClient, 'displayPlot');
      displayClearSpy = sinon.spy(boardClient, 'displayClear');
    });

    it(`calls the parent on() implementation`, () => {
      led.on(1, 2, 155);
      expect(displaySpy).to.have.been.calledOnce;
      expect(displaySpy).to.have.been.calledWith(1, 2, 155);
    });

    it(`calls the parent off() implementation`, () => {
      led.off(1, 2);
      expect(displaySpy).to.have.been.calledTwice;
      expect(displaySpy).to.have.been.calledWith(1, 2, 0);
    });

    it(`allOff() calls the parent implementation`, () => {
      led.allOff();
      expect(displayClearSpy).to.have.been.calledOnce;
    });
  });

  describe('toggle()', () => {
    let led;
    let boardClient = new MicrobitStubBoard();
    let displaySpy;

    before(() => {
      led = new LedMatrix({
        mb: boardClient
      });
      displaySpy = sinon.spy(boardClient, 'displayPlot');
    });

    it(`if LED is off, toggle triggers the parent on`, () => {
      led.allOff();
      led.toggle(1, 2, 155);
      expect(displaySpy).to.have.been.calledOnce;
      expect(displaySpy).to.have.been.calledWith(1, 2, 155);
    });

    it(`if LED is on, toggle triggers the parent off`, () => {
      led.allOff();
      led.on(2, 3, 175);
      led.toggle(2, 3, 175);
      expect(displaySpy).to.have.been.calledWith(2, 3, 0);
    });

    it(`if toggle is triggered twice on the same LED, on and off are called`, () => {
      led.allOff();
      led.toggle(1, 0, 200);
      expect(displaySpy).to.have.been.calledWith(1, 0, 200);
      led.toggle(1, 0, 200);
      expect(displaySpy).to.have.been.calledWith(1, 0, 0);
    });
  });

  describe('scrollString() and scrollInteger()', () => {
    let led;
    let boardClient = new MicrobitStubBoard();
    let scrollStringSpy;
    let scrollIntSpy;

    before(() => {
      led = new LedMatrix({
        mb: boardClient
      });
      scrollStringSpy = sinon.spy(boardClient, 'scrollString');
      scrollIntSpy = sinon.spy(boardClient, 'scrollInteger');
    });

    it(`calls the parent scrollString`, () => {
      led.scrollString('Test');
      expect(scrollStringSpy).to.have.been.calledOnce;
      expect(scrollStringSpy).to.have.been.calledWith('Test');
    });

    it(`calls the parent scrollInteger`, () => {
      led.scrollInteger(1234);
      expect(scrollIntSpy).to.have.been.calledOnce;
      expect(scrollIntSpy).to.have.been.calledWith(1234);
    });
  });
});
