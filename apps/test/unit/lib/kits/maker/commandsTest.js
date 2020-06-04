/** @file Test maker command behavior */
import {expect} from '../../../../util/deprecatedChai';
import sinon from 'sinon';
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
  pinMode
} from '@cdo/apps/lib/kits/maker/commands';
import FakeBoard from '@cdo/apps/lib/kits/maker/boards/FakeBoard';

describe('maker/commands.js', () => {
  let stubBoardController;

  beforeEach(() => {
    stubBoardController = sinon.createStubInstance(FakeBoard);
    injectBoardController(stubBoardController);
  });

  afterEach(() => {
    injectBoardController(undefined);
  });

  describe('pinMode(pin, mode)', () => {
    it('delegates to makerBoard.pinMode with mapped mode id', () => {
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
    it('delegates to makerBoard.digitalWrite', () => {
      digitalWrite({pin: 22, value: 1});
      expect(stubBoardController.digitalWrite).to.have.been.calledWith(22, 1);
    });
  });

  describe('digitalRead(pin)', () => {
    it('delegates to makerBoard.digitalRead', () => {
      digitalRead({pin: 18});
      expect(stubBoardController.digitalRead).to.have.been.calledWith(18);
    });
  });

  describe('analogWrite(pin, value)', () => {
    it('delegates to makerBoard.analogWrite', () => {
      analogWrite({pin: 22, value: 33});
      expect(stubBoardController.analogWrite).to.have.been.calledWith(22, 33);
    });
  });

  describe('analogRead(pin)', () => {
    it('delegates to makerBoard.analogRead', () => {
      analogRead({pin: 18});
      expect(stubBoardController.analogRead).to.have.been.calledWith(18);
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
      createButton({pin: 4});
      expect(stubBoardController.createButton).to.have.been.calledWith(4);
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

      beforeEach(function() {
        component = {on: sinon.spy()};
        callback = () => {};
      });

      it(`aliases 'tap:single' event to 'singleTap'`, function() {
        onBoardEvent({component, event: 'singleTap', callback});
        expect(component.on).to.have.been.calledWith('tap:single', callback);
      });

      it(`aliases 'tap:double' event to 'doubleTap'`, function() {
        onBoardEvent({component, event: 'doubleTap', callback});
        expect(component.on).to.have.been.calledWith('tap:double', callback);
      });
    });
  });
});
