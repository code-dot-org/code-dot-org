import sinon from 'sinon';
import {expect} from '../../../../../../util/deprecatedChai';

export function itMakesMBComponentsAvailableFromInterpreter(
  BoardClient,
  boardSpecificSetup
) {
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
    let board;

    beforeEach(() => {
      board = new BoardClient();
      if (boardSpecificSetup) {
        boardSpecificSetup(board);
      }

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
          'clear',
          'scrollString',
          'scrollNumber'
        ].forEach(fnName => {
          it(`${fnName}()`, () => expectLedToHaveFunction(fnName));
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
