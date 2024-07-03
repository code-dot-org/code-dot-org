import sinon from 'sinon';

import CapacitiveTouchSensor from '@cdo/apps/lib/kits/maker/boards/microBit/CapacitiveTouchSensor';
import ExternalButton from '@cdo/apps/lib/kits/maker/boards/microBit/ExternalButton';
import ExternalLed from '@cdo/apps/lib/kits/maker/boards/microBit/ExternalLed';
import MicroBitBoard from '@cdo/apps/lib/kits/maker/boards/microBit/MicroBitBoard';
import {MB_COMPONENT_COUNT} from '@cdo/apps/lib/kits/maker/boards/microBit/MicroBitConstants';
import {MBFirmataClientStub} from '@cdo/apps/lib/kits/maker/util/makeStubBoard';


import {itImplementsTheMakerBoardInterface} from '../MakerBoardInterfaceTestUtil';

import {itMakesMicroBitComponentsAvailable} from './MicroBitComponentTestUtil';
import {boardSetupAndStub} from './MicroBitTestHelperFunctions';

describe('MicroBitBoard', () => {
  let board;

  beforeEach(() => {
    // Construct a board to test on
    board = new MicroBitBoard();
    board.boardClient_ = new MBFirmataClientStub();
    boardSetupAndStub(board);
  });

  afterEach(() => {
    board = undefined;
    sinon.restore();
  });

  describe('Maker Board Interface', () => {
    itImplementsTheMakerBoardInterface(MicroBitBoard, board => {
      boardSetupAndStub(board);
      sinon.stub(board.boardClient_, 'analogRead').callsArgWith(1, 0);
      sinon.stub(board.boardClient_, 'digitalRead').callsArgWith(1, 0);
    });
    itMakesMicroBitComponentsAvailable(MicroBitBoard);
  });

  describe(`connect()`, () => {
    it('initializes a set of components', () => {
      return board.connect().then(() => {
        expect(Object.keys(board.prewiredComponents_)).toHaveLength(MB_COMPONENT_COUNT);
        expect(board.prewiredComponents_.board).toBeInstanceOf(Object);
        expect(board.prewiredComponents_.ledScreen).toBeInstanceOf(Object);
        expect(board.prewiredComponents_.tempSensor).toBeInstanceOf(Object);
        expect(board.prewiredComponents_.accelerometer).toBeInstanceOf(Object);
        expect(board.prewiredComponents_.compass).toBeInstanceOf(Object);
        expect(board.prewiredComponents_.buttonA).toBeInstanceOf(Object);
        expect(board.prewiredComponents_.buttonB).toBeInstanceOf(Object);
        expect(board.prewiredComponents_.lightSensor).toBeInstanceOf(Object);
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
        expect(accelerometerSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe(`boardConnected()`, () => {
    it('returns false at first', () => {
      expect(board.boardConnected()).toBe(false);
    });

    it('returns true after connecting', () => {
      return board.connect().then(() => {
        expect(board.boardConnected()).toBe(true);
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
        expect(pinModeSpy).toHaveBeenCalledWith(pin, arg2);
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
        expect(digitalWriteSpy).toHaveBeenCalledWith(pin, arg2);
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
        expect(digitalReadSpy).toHaveBeenCalledWith(pin, arg2);
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
        expect(analogWriteSpy).toHaveBeenCalledWith(pin, arg2);
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
        expect(analogReadSpy).toHaveBeenCalledWith(pin, arg2);
      });
    });
  });

  describe(`createLed(pin)`, () => {
    it('makes an LED controller', () => {
      return board.connect().then(() => {
        const pin = 13;
        const newLed = board.createLed(pin);
        expect(newLed).toBeInstanceOf(ExternalLed);
      });
    });
  });

  describe(`createButton(pin)`, () => {
    it('makes a button controller', () => {
      return board.connect().then(() => {
        const pin = 13;
        const newButton = board.createButton(pin);
        expect(newButton).toBeInstanceOf(ExternalButton);
      });
    });
  });

  describe(`createCapacitiveTouchSensor(pin)`, () => {
    it('makes a CapacitiveTouchSensor controller', () => {
      return board.connect().then(() => {
        const pin = 1;
        const newSensor = board.createCapacitiveTouchSensor(pin);
        expect(newSensor).toBeInstanceOf(CapacitiveTouchSensor);
      });
    });
  });

  describe(`reset()`, () => {
    it('triggers a component cleanup', () => {
      return board.connect().then(() => {
        let ledScreenSpy = sinon.spy(
          board.prewiredComponents_.ledScreen,
          'clear'
        );
        board.reset();
        expect(ledScreenSpy).toHaveBeenCalledTimes(1);
      });
    });

    it('turns off any created Leds', () => {
      return board.connect().then(() => {
        const led1 = board.createLed(0);
        const led2 = board.createLed(1);
        sinon.spy(led1, 'off');
        sinon.spy(led2, 'off');
        expect(led1.off).not.toHaveBeenCalled();
        expect(led2.off).not.toHaveBeenCalled();
        board.reset();
        expect(led1.off).toHaveBeenCalledTimes(1);
        expect(led2.off).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe(`destroy()`, () => {
    it('sends the board reset signal', () => {
      let resetSpy = sinon.spy(board.boardClient_, 'reset');
      return board
        .connect()
        .then(() => board.destroy())
        .then(() => {
          expect(resetSpy).toHaveBeenCalledTimes(1);
        });
    });

    it('turns off any created Leds', () => {
      return board.connect().then(() => {
        const led1 = board.createLed(0);
        const led2 = board.createLed(1);
        sinon.spy(led1, 'off');
        sinon.spy(led2, 'off');

        expect(led1.off).not.toHaveBeenCalled();
        expect(led2.off).not.toHaveBeenCalled();

        return board.destroy().then(() => {
          expect(led1.off).toHaveBeenCalledTimes(1);
          expect(led2.off).toHaveBeenCalledTimes(1);
        });
      });
    });

    it('does not require special cleanup for created buttons', () => {
      return board.connect().then(() => {
        board.createButton(0);
        board.createButton(1);
        return board.destroy();
      });
    });
  });
});
