/** @file Test maker command behavior for Circuit Playground and Micro:Bit*/
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {injectErrorHandler} from '@cdo/apps/lib/util/javascriptMode';
import MicroBitBoard from '@cdo/apps/maker/boards/microBit/MicroBitBoard';
import VirtualCPBoard from '@cdo/apps/maker/boards/VirtualCPBoard';
import {
  analogRead,
  analogWrite,
  boardConnected,
  createButton,
  createLed,
  digitalRead,
  digitalWrite,
  injectBoardController,
  onBoardEvent,
  pinMode,
} from '@cdo/apps/maker/commands';
import {MBFirmataClientStub} from '@cdo/apps/maker/util/makeStubBoard';

import {expect} from '../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('maker/commands.js - CircuitPlayground', () => {
  let stubBoardController, errorHandler;

  beforeEach(() => {
    stubBoardController = sinon.createStubInstance(VirtualCPBoard);
    injectBoardController(stubBoardController);
    errorHandler = {
      outputWarning: sinon.spy(),
      outputError: sinon.stub(),
    };
    injectErrorHandler(errorHandler);
  });

  afterEach(() => {
    injectBoardController(undefined);
    injectErrorHandler(null);
  });

  describe('pinMode(pin, mode)', () => {
    it('delegates to makerBoard.pinMode with mapped mode id', () => {
      pinMode({pin: 0, mode: 'input'});
      expect(stubBoardController.pinMode).to.have.been.calledWith(0, 0);
    });

    it('display warning when reserved pin 1 is used', () => {
      pinMode({pin: 1, mode: 'input'});
      expect(errorHandler.outputWarning).to.have.been.calledWith(
        'pinMode() pin parameter value (1) is a reserved pinid. Please use a different pinid.'
      );
    });

    it('display error when invalid pin 13 is used', () => {
      pinMode({pin: 13, mode: 'input'});
      expect(errorHandler.outputError).to.have.been.calledWith(
        'pinMode() pin parameter value (13) is not a valid pinid. Please use a different pinid.'
      );
    });

    it(`maps 'input' mode to 0`, () => {
      pinMode({pin: 0, mode: 'input'});
      expect(stubBoardController.pinMode).to.have.been.calledWith(0, 0);
    });

    it(`maps 'output' mode to 1`, () => {
      pinMode({pin: 0, mode: 'output'});
      expect(stubBoardController.pinMode).to.have.been.calledWith(0, 1);
    });

    it(`maps 'analog' mode to 2`, () => {
      pinMode({pin: 0, mode: 'analog'});
      expect(stubBoardController.pinMode).to.have.been.calledWith(0, 2);
    });

    it(`maps 'pwm' mode to 3`, () => {
      pinMode({pin: 0, mode: 'pwm'});
      expect(stubBoardController.pinMode).to.have.been.calledWith(0, 3);
    });

    it(`maps 'servo' mode to 4`, () => {
      pinMode({pin: 0, mode: 'servo'});
      expect(stubBoardController.pinMode).to.have.been.calledWith(0, 4);
    });
  });

  describe('digitalWrite(pin, value)', () => {
    it('delegates to makerBoard.digitalWrite', () => {
      digitalWrite({pin: 0, value: 1});
      expect(stubBoardController.digitalWrite).to.have.been.calledWith(0, 1);
    });
  });

  describe('digitalRead(pin)', () => {
    it('delegates to makerBoard.digitalRead', () => {
      digitalRead({pin: 0});
      expect(stubBoardController.digitalRead).to.have.been.calledWith(0);
    });
  });

  describe('analogWrite(pin, value)', () => {
    it('delegates to makerBoard.analogWrite', () => {
      analogWrite({pin: 0, value: 33});
      expect(stubBoardController.analogWrite).to.have.been.calledWith(0, 33);
    });
  });

  describe('analogRead(pin)', () => {
    it('delegates to makerBoard.analogRead', () => {
      analogRead({pin: 0});
      expect(stubBoardController.analogRead).to.have.been.calledWith(0);
    });
  });

  describe('boardConnected()', () => {
    it('delegates to makerBoard.boardConnected', () => {
      boardConnected();
      expect(stubBoardController.boardConnected).to.have.been.calledOnce;
    });

    it('returns whatever makerBoard returns', () => {
      stubBoardController.boardConnected.returns(true);
      expect(boardConnected()).to.be.true;
      stubBoardController.boardConnected.returns(false);
      expect(boardConnected()).to.be.false;
    });
  });

  describe('createLed(pin)', () => {
    it('delegates to makerBoard.createLed', () => {
      createLed({pin: 0});
      expect(stubBoardController.createLed).to.have.been.calledWith(0);
    });
  });

  describe('createButton(pin)', () => {
    it('delegates to makerBoard.createButton', () => {
      createButton({pin: 2});
      expect(stubBoardController.createButton).to.have.been.calledWith(2);
    });
  });

  describe('onBoardEvent(pin)', () => {
    it('forwards the call to the component', () => {
      const component = {on: sinon.spy()};
      const event = 'data';
      const callback = () => {};
      onBoardEvent({component, event, callback});
      expect(component.on).to.have.been.calledWith(event, callback);
    });

    describe(`event aliases`, () => {
      let component, callback;

      beforeEach(function () {
        component = {on: sinon.spy()};
        callback = () => {};
      });

      it(`aliases 'tap:single' event to 'singleTap'`, function () {
        onBoardEvent({component, event: 'singleTap', callback});
        expect(component.on).to.have.been.calledWith('tap:single', callback);
      });

      it(`aliases 'tap:double' event to 'doubleTap'`, function () {
        onBoardEvent({component, event: 'doubleTap', callback});
        expect(component.on).to.have.been.calledWith('tap:double', callback);
      });
    });
  });
});

describe('maker/commands.js - MicroBit', () => {
  let stubBoardController, errorHandler;

  beforeEach(() => {
    stubBoardController = sinon.createStubInstance(MicroBitBoard);
    stubBoardController.boardClient_ = new MBFirmataClientStub();
    injectBoardController(stubBoardController);
    errorHandler = {
      outputWarning: sinon.spy(),
      outputError: sinon.stub(),
    };
    injectErrorHandler(errorHandler);
  });

  afterEach(() => {
    injectBoardController(undefined);
    injectErrorHandler(null);
  });

  describe('pinMode(pin, mode)', () => {
    it('delegates to makerBoard.pinMode with mapped mode id', () => {
      pinMode({pin: 1, mode: 'input'});
      expect(stubBoardController.pinMode).to.have.been.calledWith(1, 0);
    });

    it('display error when invalid pin 3 is used', () => {
      pinMode({pin: 3, mode: 'input'});
      expect(errorHandler.outputError).to.have.been.calledWith(
        'pinMode() pin parameter value (3) is not a valid pinid. Please use a different pinid.'
      );
    });
  });
});
