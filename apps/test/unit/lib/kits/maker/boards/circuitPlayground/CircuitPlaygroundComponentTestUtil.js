/**
 * @file Exports a set of tests that verify  that the Circuit Playground board
 * components and component constructors are available from the interpreter
 */
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {N_COLOR_LEDS} from '@cdo/apps/lib/kits/maker/boards/circuitPlayground/PlaygroundConstants';

import {expect} from '../../../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

export function itMakesCircuitPlaygroundComponentsAvailable(
  BoardClient,
  boardSpecificSetup = null,
  boardSpecificTeardown = null
) {
  const CP_CONSTRUCTOR_COUNT = 13;
  const CP_COMPONENT_COUNT = 16;
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
    'TouchSensor',
  ];

  /**
   * After installing on the interpreter, test that the components and
   * component constructors are available from the interpreter
   */
  describe('Circuit Playground components accessible from interpreter', () => {
    let jsInterpreter;
    let board = new BoardClient();

    beforeEach(() => {
      jsInterpreter = {
        globalProperties: {},
        createGlobalProperty: function (key, value) {
          jsInterpreter.globalProperties[key] = value;
        },
        addCustomMarshalObject: sinon.spy(),
      };
      // Opportunity to stub anything needed to test a board
      if (boardSpecificSetup) {
        boardSpecificSetup(board);
      }

      return board.connect();
    });

    afterEach(() => {
      if (boardSpecificTeardown) {
        boardSpecificTeardown(board);
      }
    });

    describe('adds component constructors', () => {
      beforeEach(() => {
        board.installOnInterpreter(jsInterpreter);
      });

      it(`correct number of them`, () => {
        expect(jsInterpreter.addCustomMarshalObject).to.have.callCount(
          CP_CONSTRUCTOR_COUNT
        );
      });

      CP_COMPONENTS.forEach(constructor => {
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
        let globalPropsCount = CP_CONSTRUCTOR_COUNT + CP_COMPONENT_COUNT;
        expect(Object.keys(jsInterpreter.globalProperties)).to.have.length(
          globalPropsCount
        );
      });

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
          expect(Array.isArray(jsInterpreter.globalProperties.colorLeds)).to.be
            .true;
          expect(jsInterpreter.globalProperties.colorLeds).to.have.length(
            N_COLOR_LEDS
          );
        });

        // Set of required functions derived from our dropletConfig
        ['on', 'off', 'toggle', 'blink', 'stop', 'intensity', 'color'].forEach(
          fnName => {
            it(`${fnName}()`, () => expectEachColorLedToHaveFunction(fnName));
          }
        );
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
          expect(jsInterpreter.globalProperties.toggleSwitch.isOpen).to.be.a(
            'boolean'
          );
        });
      });

      ['soundSensor', 'lightSensor'].forEach(sensorName => {
        describe(sensorName, () => {
          let component;

          beforeEach(() => {
            component = jsInterpreter.globalProperties[sensorName];
          });

          it('value', () => {
            expect(component).to.have.property('value');
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

          it('isPressed', () => {
            expect(component.isPressed).to.be.a('boolean');
          });
          it('holdtime', () => {
            expect(component.holdtime).to.be.a('number');
          });
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

        it('start()', () => {
          expect(component.start).to.be.a('function');
        });
        it('getOrientation()', () => {
          expect(component.getOrientation).to.be.a('function');
        });
        it('getAcceleration()', () => {
          expect(component.getAcceleration).to.be.a('function');
        });
      });

      describe('board', () => {
        it('exists', () => {
          expect(jsInterpreter.globalProperties).to.have.ownProperty('board');
        });
      });
    });
  });
}
