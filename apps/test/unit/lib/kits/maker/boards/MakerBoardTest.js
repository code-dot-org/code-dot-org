/** @file Exports a set of tests that verify the MakerBoard interface */
import sinon from 'sinon';
import {EventEmitter} from 'events'; // see node-libs-browser
import {expect} from '../../../../../util/deprecatedChai';
import CircuitPlaygroundBoard from '@cdo/apps/lib/kits/maker/boards/circuitPlayground/CircuitPlaygroundBoard';
import FakeBoard from '@cdo/apps/lib/kits/maker/boards/FakeBoard';
import MicroBitBoard from '@cdo/apps/lib/kits/maker/boards/microBit/MicroBitBoard';

/**
 * Interface that our board controllers must implement to be usable with
 * Maker Toolkit.
 * @interface MakerBoard
 * @extends EventEmitter
 */

/**
 * Run the set of interface conformance tests on the provided class.
 * @param {function} BoardClass
 * @param {function} boardSpecificSetup optional
 */
export function itImplementsTheMakerBoardInterface(
  BoardClass,
  boardSpecificSetup = null,
  boardSpecificTeardown = null
) {
  describe('implements the MakerBoard interface', () => {
    let board;

    beforeEach(() => {
      board = new BoardClass();
      // Opportunity to stub anything needed to test a board
      if (boardSpecificSetup) {
        boardSpecificSetup(board);
      }
    });

    afterEach(() => {
      if (boardSpecificTeardown) {
        boardSpecificTeardown(board);
      }
    });

    it('is an EventEmitter', () => {
      expect(board).to.be.an.instanceOf(EventEmitter);
    });

    /**
     * Open a connection to the board on its configured port.
     *
     * @function
     * @name MakerBoard#connect
     * @returns {Promise} resolved when the board is ready to use.
     */
    describe('connect()', () => {
      it('returns a Promise', () => {
        const retVal = board.connect();
        expect(retVal.then).to.be.a('function');
        return retVal;
      });
    });

    /**
     * Disconnect and clean up the board controller and all components.
     *
     * @function
     * @name MakerBoard#destroy
     */
    describe('destroy()', () => {
      it(`returns a promise`, () => {
        const retVal = board.destroy();
        expect(retVal).to.be.an.instanceOf(Promise);
        return retVal;
      });
    });

    /**
     * Marshals the board component controllers and appropriate constants into the
     * given JS Interpreter instance so they can be used by student code.
     *
     * @function
     * @name MakerBoard#installOnInterpreter
     * @param {codegen} codegen
     * @param {JSInterpreter} jsInterpreter
     */
    describe('installOnInterpreter(codegen, jsInterpreter)', () => {
      let jsInterpreter;

      beforeEach(() => {
        jsInterpreter = {
          globalProperties: {},
          createGlobalProperty: function(key, value) {
            jsInterpreter.globalProperties[key] = value;
          },
          addCustomMarshalObject: sinon.spy()
        };

        return board.connect();
      });

      it(`doesn't return anything`, () => {
        const retVal = board.installOnInterpreter(jsInterpreter);
        expect(retVal).to.be.undefined;
      });
    });

    /**
     * @function
     * @name MakerBoard#pinMode
     * @param {number} pin
     * @param {number} modeConstant
     */
    describe(`pinMode(pin, modeConstant)`, () => {
      it(`doesn't return anything`, () => {
        return board.connect().then(() => {
          const retVal = board.pinMode(11, 1023);
          expect(retVal).to.be.undefined;
        });
      });
    });

    /**
     * @function
     * @name MakerBoard#digitalWrite
     * @param {number} pin
     * @param {number} value
     */
    describe(`digitalWrite(pin, value)`, () => {
      it(`doesn't return anything`, () => {
        return board.connect().then(() => {
          const retVal = board.digitalWrite(11, 1023);
          expect(retVal).to.be.undefined;
        });
      });
    });

    /**
     * @function
     * @name MakerBoard#digitalRead
     * @param {number} pin
     * @param {function.<number>} callback
     */
    describe(`digitalRead(pin, callback)`, () => {
      beforeEach(() => {
        return board.connect();
      });

      it(`doesn't return anything`, () => {
        const retVal = board.digitalRead(11, () => {});
        expect(retVal).to.be.undefined;
      });

      it(`calls callback with value`, done => {
        board.digitalRead(11, value => {
          expect(value).to.be.a('number');
          done();
        });
      });
    });

    /**
     * @function
     * @name MakerBoard#analogWrite
     * @param {number} pin
     * @param {number} value
     */
    describe(`analogWrite(pin, value)`, () => {
      it(`doesn't return anything`, () => {
        return board.connect().then(() => {
          const retVal = board.analogWrite(11, () => {});
          expect(retVal).to.be.undefined;
        });
      });
    });

    /**
     * @function
     * @name MakerBoard#analogRead
     * @param {number} pin
     * @param {function.<number>} callback
     */
    describe(`analogRead(pin, callback)`, () => {
      beforeEach(() => {
        return board.connect();
      });
      it(`doesn't return anything`, () => {
        const retVal = board.analogRead(11, () => {});
        expect(retVal).to.be.undefined;
      });

      it(`calls callback with value`, done => {
        board.analogRead(11, value => {
          expect(value).to.be.a('number');
          done();
        });
      });
    });

    /**
     * @function
     * @name MakerBoard#boardConnected
     * @return {boolean} whether a real board is connected
     */
    describe(`boardConnected()`, () => {
      it(`returns a boolean`, () => {
        expect(board.boardConnected()).to.be.a('boolean');
      });
    });

    /**
     * @function
     * @name MakerBoard#createLed
     * @param {number} pin
     * @return {Led} a newly constructed Led component
     */
    describe(`createLed(pin)`, () => {
      beforeEach(() => {
        return board.connect();
      });

      it(`returns an Led component`, () => {
        const led = board.createLed(10);
        // FakeBoard doesn't provide an LED component, so check the basic LED
        // shape instead.
        expect(led.on).to.be.a('function');
        expect(led.off).to.be.a('function');
        expect(led.toggle).to.be.a('function');

        if (BoardClass === CircuitPlaygroundBoard || BoardClass === FakeBoard) {
          expect(led.blink).to.be.a('function');
          expect(led.pulse).to.be.a('function');
        }
      });
    });

    /**
     * @function
     * @name MakerBoard#createButton
     * @param {number} pin
     * @return {Button} a newly constructed Button component
     */
    describe(`createButton(pin)`, () => {
      // Example code:
      // var newButton = createButton(2);
      // onBoardEvent(newButton, "down", function() {
      //   console.log("pressed");
      // });

      beforeEach(() => {
        return board.connect();
      });

      it(`returns a Button component`, () => {
        const button = board.createButton(10);
        // Check the basic button shape
        expect(button).to.be.an.instanceOf(EventEmitter);
        expect(button).to.have.property('isPressed');
        expect(button).to.have.property('holdtime');
      });
    });

    if (BoardClass === MicroBitBoard) {
      /**
       * @function
       * @name MakerBoard#createCapacitiveTouchSensor
       * @param {number} pin
       * @return {EventEmitter} a newly constructed CapTouch component
       */
      describe(`createCapacitiveTouchSensor(pin)`, () => {
        // Example code:
        // var newSensor = createCapacitiveTouchSensor(2);
        // onBoardEvent(newSensor, "down", function() {
        //   console.log("pressed");
        // });

        beforeEach(() => {
          return board.connect();
        });

        it(`returns an Event Emitter with isPressed property`, () => {
          const button = board.createCapacitiveTouchSensor(2);
          // Check the basic button shape
          expect(button).to.be.an.instanceOf(EventEmitter);
          expect(button).to.have.property('isPressed');
        });
      });
    }
  });
}
