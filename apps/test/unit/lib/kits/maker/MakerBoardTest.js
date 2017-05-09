/** @file Exports a set of tests that verify the MakerBoard interface */
import sinon from 'sinon';
import {EventEmitter} from 'events'; // see node-libs-browser
import {expect} from '../../../../util/configuredChai';

/**
 * Interface that our board controllers must implement to be usable with
 * Maker Toolkit.
 * @interface MakerBoard
 * @extends EventEmitter
 */

/**
 * Run the set of interface conformance tests on the provided class.
 * @param {function} BoardClass
 */
export function itImplementsTheMakerBoardInterface(BoardClass) {
  describe('implements the MakerBoard interface', () => {
    let board;

    beforeEach(() => {
      board = new BoardClass();
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
      it(`doesn't return anything`, () => {
        const retVal = board.destroy();
        expect(retVal).to.be.undefined;
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
      const CONSTRUCTOR_COUNT = 13;
      const COMPONENT_COUNT = 16;
      let jsInterpreter;

      beforeEach(() => {
        jsInterpreter = {
          globalProperties: {},
          createGlobalProperty: function (key, value) {
            jsInterpreter.globalProperties[key] = value;
          },
          addCustomMarshalObject: sinon.spy(),
        };

        return board.connect();
      });

      it(`doesn't return anything`, () => {
        const retVal = board.installOnInterpreter(jsInterpreter);
        expect(retVal).to.be.undefined;
      });

      describe('adds component constructors', () => {
        beforeEach(() => {
          board.installOnInterpreter(jsInterpreter);
        });

        it(`${CONSTRUCTOR_COUNT} of them`, () => {
          expect(jsInterpreter.addCustomMarshalObject).to.have.callCount(13);
        });

        [
          'Led',
          'Board',
          'RGB',
          'Button',
          'Switch',
          'Piezo',
          'Sensor',
          'Thermometer',
          'Pin',
          'Accelerometer',
          'Animation',
          'Servo',
          'TouchSensor',
        ].forEach(constructor => {
          it(constructor, () => {
            expect(jsInterpreter.globalProperties).to.have.ownProperty(constructor);
            expect(jsInterpreter.globalProperties[constructor]).to.be.a('function');
            const passedObjects = jsInterpreter.addCustomMarshalObject.args.map(call => call[0].instance);
            expect(passedObjects).to.include(jsInterpreter.globalProperties[constructor]);
          });
        });
      });

      describe('adds components', () => {
        beforeEach(() => {
          board.installOnInterpreter(jsInterpreter);
        });

        it(`${COMPONENT_COUNT} of them`, () => {
          expect(Object.keys(jsInterpreter.globalProperties))
              .to.have.length(CONSTRUCTOR_COUNT + COMPONENT_COUNT);
        });

        [
          'board',
          'colorLeds',
          'led',
          'toggleSwitch',
          'buzzer',
          'soundSensor',
          'lightSensor',
          'tempSensor',
          'accelerometer',
          'buttonL',
          'buttonR',
          'INPUT',
          'OUTPUT',
          'ANALOG',
          'PWM',
          'SERVO',
        ].forEach(componentName => {
          it(componentName, () => {
            expect(interpreter.globalProperties).to.have.ownProperty(componentName);
          });
        });
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
      it(`doesn't return anything`, () => {
        return board.connect().then(() => {
          const retVal = board.digitalRead(11, () => {});
          expect(retVal).to.be.undefined;
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
      it(`doesn't return anything`, () => {
        return board.connect().then(() => {
          const retVal = board.analogRead(11, () => {});
          expect(retVal).to.be.undefined;
        });
      });
    });
  });
}
