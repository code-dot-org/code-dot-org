import sinon from 'sinon';
import {expect} from '../../../../../../util/deprecatedChai';

export function testComponentsMicroBit(board) {
  const MB_CONSTRUCTOR_COUNT = 4;
  const MB_COMPONENT_COUNT = 6;
  const MB_COMPONENTS = [
    'LedMatrix',
    'MicroBitButton',
    'Accelerometer',
    'MicroBitThermometer'
  ];

  /**
   * After installing on the interpreter, test that the components and
   * component constructors are available from the interpreter
   */
  describe('Micro Bit components accessible from interpreter', () => {
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

    describe('adds component constructors', () => {
      beforeEach(() => {
        board.installOnInterpreter(jsInterpreter);
      });

      it(`correct number of them`, () => {
        expect(jsInterpreter.addCustomMarshalObject).to.have.callCount(
          MB_CONSTRUCTOR_COUNT
        );
      });

      MB_COMPONENTS.forEach(constructor => {
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
          it('holdtime', () => expect(component.holdtime).to.be.a('number'));
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
}
