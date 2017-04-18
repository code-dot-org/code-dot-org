/** @file Test maker command behavior */
import {expect} from '../../../../util/configuredChai';
import sinon from 'sinon';
import {
  analogRead,
  analogWrite,
  digitalRead,
  digitalWrite,
  injectBoardController,
  onBoardEvent,
  pinMode
} from '@cdo/apps/lib/kits/maker/commands';
import CircuitPlaygroundBoard from '@cdo/apps/lib/kits/maker/CircuitPlaygroundBoard';

describe('maker/commands.js', () => {
  let stubBoardController;

  beforeEach(() => {
    stubBoardController = sinon.createStubInstance(CircuitPlaygroundBoard);
    injectBoardController(stubBoardController);
  });

  afterEach(() => {
    injectBoardController(undefined);
  });

  describe('pinMode(pin, mode)', () => {
    it('delegates to makerController.pinMode with mapped mode id', () => {
      pinMode({pin: 1, mode: 'input'});
      expect(stubBoardController.pinMode).to.have.been.calledWith(1, 0);
    });

    it(`maps 'input' mode to 0`, () => {
      pinMode({pin: 42, mode: 'input'});
      expect(stubBoardController.pinMode).to.have.been.calledWith(42, 0);
    });

    it(`maps 'output' mode to 1`, () => {
      pinMode({pin: 42, mode: 'output'});
      expect(stubBoardController.pinMode).to.have.been.calledWith(42, 1);
    });

    it(`maps 'analog' mode to 2`, () => {
      pinMode({pin: 42, mode: 'analog'});
      expect(stubBoardController.pinMode).to.have.been.calledWith(42, 2);
    });

    it(`maps 'pwm' mode to 3`, () => {
      pinMode({pin: 42, mode: 'pwm'});
      expect(stubBoardController.pinMode).to.have.been.calledWith(42, 3);
    });

    it(`maps 'servo' mode to 4`, () => {
      pinMode({pin: 42, mode: 'servo'});
      expect(stubBoardController.pinMode).to.have.been.calledWith(42, 4);
    });
  });

  describe('digitalWrite(pin, value)', () => {
    it('delegates to makerController.digitalWrite', () => {
      digitalWrite({pin: 22, value: 1});
      expect(stubBoardController.digitalWrite).to.have.been.calledWith(22, 1);
    });
  });

  describe('digitalRead(pin)', () => {
    it('delegates to makerController.digitalRead', () => {
      digitalRead({pin: 18});
      expect(stubBoardController.digitalRead).to.have.been.calledWith(18);
    });
  });

  describe('analogWrite(pin, value)', () => {
    it('delegates to makerController.analogWrite', () => {
      analogWrite({pin: 22, value: 33});
      expect(stubBoardController.analogWrite).to.have.been.calledWith(22, 33);
    });
  });

  describe('analogRead(pin)', () => {
    it('delegates to makerController.analogRead', () => {
      analogRead({pin: 18});
      expect(stubBoardController.analogRead).to.have.been.calledWith(18);
    });
  });

  describe('onBoardEvent(pin)', () => {
    it('delegates to makerController.onBoardEvent', () => {
      const fakeComponent = {};
      const eventName = 'data';
      const fakeCallback = () => {};
      onBoardEvent({
        component: fakeComponent,
        event: eventName,
        callback: fakeCallback
      });
      expect(stubBoardController.onBoardEvent).to.have.been
        .calledWith(fakeComponent, eventName, fakeCallback);
    });
  });
});
