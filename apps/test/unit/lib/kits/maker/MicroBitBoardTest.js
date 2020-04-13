import {expect} from '../../../../util/deprecatedChai';
import MicroBitBoard from '@cdo/apps/lib/kits/maker/MicroBitBoard';
import {MicrobitStubBoard} from './makeStubBoard';
import sinon from 'sinon';
import {itImplementsTheMakerBoardInterface} from './MakerBoardTest';
import ExternalLed from '@cdo/apps/lib/kits/maker/ExternalLed';

describe('MicroBitBoard', () => {
  let board;

  beforeEach(() => {
    // Construct a board to test on
    window.SerialPort = {};
    board = new MicroBitBoard();
    board.boardClient_ = new MicrobitStubBoard();
  });

  afterEach(() => {
    board = undefined;
  });

  describe('Maker Board Interface', () => {
    itImplementsTheMakerBoardInterface(MicroBitBoard, board => {
      sinon.stub(board.boardClient_, 'connect').callsFake(() => {
        board.boardClient_.myPort = {write: () => {}};
        sinon.stub(board.boardClient_.myPort, 'write');
      });

      sinon.stub(board.boardClient_, 'analogRead').callsArgWith(1, 0);
      sinon.stub(board.boardClient_, 'digitalRead').callsArgWith(1, 0);
    });
  });

  describe(`connect()`, () => {
    it('initializes a set of components', () => {
      return board.connect().then(() => {
        expect(Object.keys(board.prewiredComponents_)).to.have.length(6);
        expect(board.prewiredComponents_.board).to.be.a('object');
        expect(board.prewiredComponents_.ledMatrix).to.be.a('object');
        expect(board.prewiredComponents_.tempSensor).to.be.a('object');
        expect(board.prewiredComponents_.accelerometer).to.be.a('object');
        expect(board.prewiredComponents_.buttonA).to.be.a('object');
        expect(board.prewiredComponents_.buttonB).to.be.a('object');
      });
    });
  });

  describe(`enableComponents())`, () => {
    it('triggers a component start call if there are prewired components', () => {
      return board.connect().then(() => {
        // Spy on the accelerometer to see if enableComponents called
        // enableMicroBitComponents which then starts the accelerometer.
        let accelerometerSpy = sinon.spy(
          board.prewiredComponents_.accelerometer,
          'start'
        );
        board.enableComponents();
        expect(accelerometerSpy).to.have.been.calledOnce;
      });
    });
  });

  describe(`boardConnected()`, () => {
    it('returns false at first', () => {
      expect(board.boardConnected()).to.be.false;
    });

    it('returns true after connecting', () => {
      return board.connect().then(() => {
        expect(board.boardConnected()).to.be.true;
      });
    });
  });

  describe(`pinMode(pin, modeConstant)`, () => {
    it('forwards the call to board', () => {
      return board.connect().then(() => {
        let pinModeSpy = sinon.spy(board.boardClient_, 'setPinMode');
        const pin = 11;
        const arg2 = 1023;
        board.pinMode(pin, arg2);
        expect(pinModeSpy).to.have.been.calledWith(pin, arg2);
      });
    });
  });

  describe(`digitalWrite(pin, value)`, () => {
    it('forwards the call to firmata', () => {
      return board.connect().then(() => {
        let digitalWriteSpy = sinon.spy(board.boardClient_, 'digitalWrite');
        const pin = 11;
        const arg2 = 1023;
        board.digitalWrite(pin, arg2);
        expect(digitalWriteSpy).to.have.been.calledWith(pin, arg2);
      });
    });
  });

  describe(`digitalRead(pin, callback)`, () => {
    it('forwards the call to firmata', () => {
      return board.connect().then(() => {
        let digitalReadSpy = sinon.spy(board.boardClient_, 'digitalRead');
        const pin = 11;
        const arg2 = () => {};
        board.digitalRead(pin, arg2);
        expect(digitalReadSpy).to.have.been.calledWith(pin, arg2);
      });
    });
  });

  describe(`analogWrite(pin, value)`, () => {
    it('forwards the call to firmata', () => {
      return board.connect().then(() => {
        let analogWriteSpy = sinon.spy(board.boardClient_, 'analogWrite');
        const pin = 11;
        const arg2 = 1023;
        board.analogWrite(pin, arg2);
        expect(analogWriteSpy).to.have.been.calledWith(pin, arg2);
      });
    });
  });

  describe(`analogRead(pin, callback)`, () => {
    it('forwards the call to firmata', () => {
      return board.connect().then(() => {
        let analogReadSpy = sinon.spy(board.boardClient_, 'analogRead');
        const pin = 11;
        const arg2 = () => {};
        board.analogRead(pin, arg2);
        expect(analogReadSpy).to.have.been.calledWith(pin, arg2);
      });
    });
  });

  describe(`createLed(pin)`, () => {
    it('makes an LED controller', () => {
      return board.connect().then(() => {
        const pin = 13;
        const newLed = board.createLed(pin);
        expect(newLed).to.be.an.instanceOf(ExternalLed);
      });
    });
  });

  describe(`reset()`, () => {
    it('triggers a component cleanup', () => {
      return board.connect().then(() => {
        let ledMatrixSpy = sinon.spy(
          board.prewiredComponents_.ledMatrix,
          'allOff'
        );
        board.reset();
        expect(ledMatrixSpy).to.have.been.calledOnce;
      });
    });
  });
});
