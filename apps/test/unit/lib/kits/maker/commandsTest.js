/** @file Test maker command behavior */
import {expect} from '../../../../util/configuredChai';
import {replaceOnWindow, restoreOnWindow} from '../../../../util/testUtils';
import sinon from 'sinon';
import {
  pinMode,
  timedLoop
} from '@cdo/apps/lib/kits/maker/commands';

describe('maker commands', () => {
  describe('pinMode(pin, mode)', () => {
    beforeEach(() => {
      replaceOnWindow('Applab', {
        makerController: {
          pinMode: sinon.spy()
        }
      });
    });

    afterEach(() => {
      restoreOnWindow('Applab');
    });

    it('delegates to makerController.pinMode with mapped mode id', () => {
      pinMode({pin: 1, mode: 'input'});
      expect(Applab.makerController.pinMode).to.have.been.calledWith(1, 0);
    });

    it(`maps 'input' mode to 0`, () => {
      pinMode({pin: 42, mode: 'input'});
      expect(Applab.makerController.pinMode).to.have.been.calledWith(42, 0);
    });

    it(`maps 'output' mode to 1`, () => {
      pinMode({pin: 42, mode: 'output'});
      expect(Applab.makerController.pinMode).to.have.been.calledWith(42, 1);
    });

    it(`maps 'analog' mode to 2`, () => {
      pinMode({pin: 42, mode: 'analog'});
      expect(Applab.makerController.pinMode).to.have.been.calledWith(42, 2);
    });

    it(`maps 'pwm' mode to 3`, () => {
      pinMode({pin: 42, mode: 'pwm'});
      expect(Applab.makerController.pinMode).to.have.been.calledWith(42, 3);
    });

    it(`maps 'servo' mode to 4`, () => {
      pinMode({pin: 42, mode: 'servo'});
      expect(Applab.makerController.pinMode).to.have.been.calledWith(42, 4);
    });
  });

  describe('timedLoop(ms, callback)', () => {
    it('runs code on an interval', () => {
      const clock = sinon.useFakeTimers();

      const spy = sinon.spy();
      let stopLoop;
      timedLoop({
        ms: 50,
        callback: exit => {
          stopLoop = exit;
          spy();
        }
      });

      expect(spy).not.to.have.been.called;

      clock.tick(49);
      expect(spy).not.to.have.been.called;

      clock.tick(1);
      expect(spy).to.have.been.calledOnce;

      clock.tick(50);
      expect(spy).to.have.been.calledTwice;

      stopLoop();
      clock.tick(50);
      expect(spy).to.have.been.calledTwice;

      clock.restore();
    });
  });
});
