import sinon from 'sinon';
import {expect} from '../../../../../../util/deprecatedChai';

export function testComponentsMicroBit(board) {
  const MB_CONSTRUCTOR_COUNT = 4;
  const MB_COMPONENT_COUNT = 6;

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
        let globalPropsCount = MB_CONSTRUCTOR_COUNT + MB_COMPONENT_COUNT;
        expect(Object.keys(jsInterpreter.globalProperties)).to.have.length(
          globalPropsCount
        );
      });

      ['buttonA', 'buttonB'].forEach(button => {
        describe(button, () => {
          let component;

          beforeEach(() => {
            component = jsInterpreter.globalProperties[button];
          });

          it('isPressed', () => expect(component.isPressed).to.be.a('boolean'));
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
