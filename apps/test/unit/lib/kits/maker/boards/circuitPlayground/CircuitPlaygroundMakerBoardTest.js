import sinon from 'sinon';
import {expect} from '../../../../../../util/deprecatedChai';
import {N_COLOR_LEDS} from '@cdo/apps/lib/kits/maker/boards/circuitPlayground/PlaygroundConstants';

export function testComponentsCircuitPlayground(board) {
  const CP_CONSTRUCTOR_COUNT = 13;
  const CP_COMPONENT_COUNT = 16;
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

      // Board-specific tests
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

          it('isPressed', () => expect(component.isPressed).to.be.a('boolean'));
          it('holdtime', () => expect(component.holdtime).to.be.a('number'));
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
    });
  });
}
