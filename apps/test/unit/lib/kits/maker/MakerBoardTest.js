/** @file Exports a set of tests that verify the MakerBoard interface */
import sinon from 'sinon';
import {EventEmitter} from 'events'; // see node-libs-browser
import {expect} from '../../../../util/deprecatedChai';
import {N_COLOR_LEDS} from '@cdo/apps/lib/kits/maker/PlaygroundConstants';
import MicroBitBoard from '@cdo/apps/lib/kits/maker/MicroBitBoard';
import CircuitPlaygroundBoard from '@cdo/apps/lib/kits/maker/CircuitPlaygroundBoard';
import FakeBoard from '@cdo/apps/lib/kits/maker/FakeBoard';

/**
 * Interface that our board controllers must implement to be usable with
 * Maker Toolkit.
 * @interface MakerBoard
 * @extends EventEmitter
 */

const CP_CONSTRUCTOR_COUNT = 13;
const CP_COMPONENT_COUNT = 16;
const MB_CONSTRUCTOR_COUNT = 4;
const MB_COMPONENT_COUNT = 6;
const CP_COMPONENTS = [
  'Led',
  'Board',
  'NeoPixel',
  'PlaygroundButton',
  'Switch',
  'Piezo',
  'Sensor',
  'Thermometer',
  'Pin',
  'Accelerometer',
  'Animation',
  'Servo',
  'TouchSensor'
];
const MB_COMPONENTS = [
  'LedMatrix',
  'MicroBitButton',
  'Accelerometer',
  'MicroBitThermometer'
];

/**
 * Run the set of interface conformance tests on the provided class.
 * @param {function} BoardClass
 * @param {function} boardSpecificSetup optional
 */
export function itImplementsTheMakerBoardInterface(
  BoardClass,
  boardSpecificSetup = null
) {
  describe('implements the MakerBoard interface', () => {
    let board;

    beforeEach(() => {
      board = new BoardClass();
      // Opportunity to stub any needed to test a board
      if (boardSpecificSetup) {
        boardSpecificSetup(board);
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

      describe('adds component constructors', () => {
        beforeEach(() => {
          board.installOnInterpreter(jsInterpreter);
        });

        it(`correct number of them`, () => {
          let constructorCount =
            BoardClass === MicroBitBoard
              ? MB_CONSTRUCTOR_COUNT
              : CP_CONSTRUCTOR_COUNT;
          expect(jsInterpreter.addCustomMarshalObject).to.have.callCount(
            constructorCount
          );
        });

        let components =
          BoardClass === MicroBitBoard ? MB_COMPONENTS : CP_COMPONENTS;

        components.forEach(constructor => {
          it(constructor, () => {
            expect(jsInterpreter.globalProperties).to.have.ownProperty(
              constructor
            );
            expect(jsInterpreter.globalProperties[constructor]).to.be.a(
              'function'
            );
            const passedObjects = jsInterpreter.addCustomMarshalObject.args.map(
              call => call[0].instance
            );
            expect(passedObjects).to.include(
              jsInterpreter.globalProperties[constructor]
            );
          });
        });
      });

      describe('adds components', () => {
        beforeEach(() => {
          board.installOnInterpreter(jsInterpreter);
        });

        it(`correct number of them`, () => {
          let globalPropsCount =
            BoardClass === MicroBitBoard
              ? MB_CONSTRUCTOR_COUNT + MB_COMPONENT_COUNT
              : CP_CONSTRUCTOR_COUNT + CP_COMPONENT_COUNT;
          expect(Object.keys(jsInterpreter.globalProperties)).to.have.length(
            globalPropsCount
          );
        });

        // Board-specific tests
        if (BoardClass === CircuitPlaygroundBoard || BoardClass === FakeBoard) {
          describe('led', () => {
            function expectLedToHaveFunction(fnName) {
              expect(jsInterpreter.globalProperties.led[fnName]).to.be.a(
                'function'
              );
            }

            // Set of required functions derived from our dropletConfig
            ['on', 'off', 'toggle', 'blink', 'pulse'].forEach(fnName => {
              it(`${fnName}()`, () => expectLedToHaveFunction(fnName));
            });
          });

          describe('colorLeds[]', () => {
            function expectEachColorLedToHaveFunction(fnName) {
              jsInterpreter.globalProperties.colorLeds.forEach(led => {
                expect(led[fnName]).to.be.a('function');
              });
            }

            it(`is an array of ${N_COLOR_LEDS} color led components`, () => {
              expect(Array.isArray(jsInterpreter.globalProperties.colorLeds)).to
                .be.true;
              expect(jsInterpreter.globalProperties.colorLeds).to.have.length(
                N_COLOR_LEDS
              );
            });

            // Set of required functions derived from our dropletConfig
            [
              'on',
              'off',
              'toggle',
              'blink',
              'stop',
              'intensity',
              'color'
            ].forEach(fnName => {
              it(`${fnName}()`, () => expectEachColorLedToHaveFunction(fnName));
            });
          });

          describe('buzzer', () => {
            function expectBuzzerToHaveFunction(fnName) {
              expect(jsInterpreter.globalProperties.buzzer[fnName]).to.be.a(
                'function'
              );
            }

            // Set of required functions derived from our dropletConfig
            ['frequency', 'note', 'off', 'stop', 'play'].forEach(fnName => {
              it(`${fnName}()`, () => expectBuzzerToHaveFunction(fnName));
            });
          });

          describe('toggleSwitch', () => {
            it('isOpen', () => {
              expect(
                jsInterpreter.globalProperties.toggleSwitch.isOpen
              ).to.be.a('boolean');
            });
          });

          ['soundSensor', 'lightSensor'].forEach(sensorName => {
            describe(sensorName, () => {
              let component;

              beforeEach(() => {
                component = jsInterpreter.globalProperties[sensorName];
              });

              it('start()', () => {
                expect(component.start).to.be.a('function');
              });

              it('value', () => {
                expect(component).to.have.property('value');
              });

              it('getAveragedValue()', () => {
                expect(component.getAveragedValue).to.be.a('function');
                expect(component.getAveragedValue()).to.be.a('number');
              });

              it('setScale()', () => {
                expect(component.setScale).to.be.a('function');
              });

              it('threshold', () => {
                expect(component.threshold).to.be.a('number');
              });
            });
          });

          ['buttonL', 'buttonR'].forEach(button => {
            describe(button, () => {
              let component;

              beforeEach(() => {
                component = jsInterpreter.globalProperties[button];
              });

              it('isPressed', () =>
                expect(component.isPressed).to.be.a('boolean'));
              it('holdtime', () =>
                expect(component.holdtime).to.be.a('number'));
            });
          });

          describe('Constants', () => {
            it('INPUT', () => {
              expect(jsInterpreter.globalProperties.INPUT).to.equal(0);
            });

            it('OUTPUT', () => {
              expect(jsInterpreter.globalProperties.OUTPUT).to.equal(1);
            });

            it('ANALOG', () => {
              expect(jsInterpreter.globalProperties.ANALOG).to.equal(2);
            });

            it('PWM', () => {
              expect(jsInterpreter.globalProperties.PWM).to.equal(3);
            });

            it('SERVO', () => {
              expect(jsInterpreter.globalProperties.SERVO).to.equal(4);
            });
          });
        }

        // Board-specific tests
        if (BoardClass === MicroBitBoard) {
          ['buttonA', 'buttonB'].forEach(button => {
            describe(button, () => {
              let component;

              beforeEach(() => {
                component = jsInterpreter.globalProperties[button];
              });

              it('isPressed', () =>
                expect(component.isPressed).to.be.a('boolean'));
            });
          });

          describe('ledMatrix', () => {
            function expectLedToHaveFunction(fnName) {
              expect(jsInterpreter.globalProperties.ledMatrix[fnName]).to.be.a(
                'function'
              );
            }

            // Set of required functions derived from our dropletConfig
            [
              'on',
              'off',
              'toggle',
              'allOff',
              'scrollString',
              'scrollInteger'
            ].forEach(fnName => {
              it(`${fnName}()`, () => expectLedToHaveFunction(fnName));
            });
          });
        }

        describe('tempSensor', () => {
          let component;

          beforeEach(() => {
            component = jsInterpreter.globalProperties.tempSensor;
          });

          it('F', () => {
            expect(component).to.have.property('F');
          });

          it('C', () => {
            expect(component).to.have.property('C');
          });
        });

        describe('accelerometer', () => {
          let component;

          beforeEach(() => {
            component = jsInterpreter.globalProperties.accelerometer;
          });

          it('start()', () => expect(component.start).to.be.a('function'));
          it('getOrientation()', () =>
            expect(component.getOrientation).to.be.a('function'));
          it('getAcceleration()', () =>
            expect(component.getAcceleration).to.be.a('function'));
        });

        describe('board', () => {
          it('exists', () => {
            expect(jsInterpreter.globalProperties).to.have.ownProperty('board');
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

    if (BoardClass === CircuitPlaygroundBoard || BoardClass === FakeBoard) {
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
          expect(led.blink).to.be.a('function');
          expect(led.toggle).to.be.a('function');
          expect(led.pulse).to.be.a('function');
        });
      });
    }

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

        // TODO - not yet implemented for microbit
        if (BoardClass === CircuitPlaygroundBoard || BoardClass === FakeBoard) {
          expect(button).to.have.property('holdtime');
        }
      });
    });
  });
}
