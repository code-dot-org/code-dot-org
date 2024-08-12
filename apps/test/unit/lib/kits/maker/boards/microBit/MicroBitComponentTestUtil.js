/**
 * @file Exports a set of tests that verify  that the micro:bit board
 * components and component constructors are available from the interpreter
 */
import {
  MB_COMPONENT_COUNT,
  MB_COMPONENTS,
} from '@cdo/apps/maker/boards/microBit/MicroBitConstants';

import {expect} from '../../../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

import {boardSetupAndStub} from './MicroBitTestHelperFunctions';
export function itMakesMicroBitComponentsAvailable(
  Board,
  boardSpecificSetup = null,
  boardSpecificTeardown = null
) {
  /**
   * After installing on the interpreter, test that the components and
   * component constructors are available from the interpreter
   */
  describe('Micro Bit components accessible from interpreter', () => {
    let jsInterpreter;
    let board;

    beforeEach(() => {
      board = new Board();
      boardSetupAndStub(board);

      jsInterpreter = {
        globalProperties: {},
        createGlobalProperty: function (key, value) {
          jsInterpreter.globalProperties[key] = value;
        },
        addCustomMarshalObject: jest.fn(),
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
        expect(jsInterpreter.addCustomMarshalObject.mock.calls).to.have.length(
          MB_COMPONENTS.length
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
          const passedObjects =
            jsInterpreter.addCustomMarshalObject.mock.calls.map(
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
        let globalPropsCount = MB_COMPONENTS.length + MB_COMPONENT_COUNT;
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

          it('isPressed', () => {
            expect(component.isPressed).to.be.a('boolean');
          });
          it('holdtime', () => {
            expect(component.holdtime).to.be.a('number');
          });
        });
      });

      describe('ledScreen', () => {
        function expectLedToHaveFunction(fnName) {
          expect(jsInterpreter.globalProperties.ledScreen[fnName]).to.be.a(
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
          'scrollNumber',
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

      describe('lightSensor', () => {
        let component;

        beforeEach(() => {
          component = jsInterpreter.globalProperties.lightSensor;
        });

        it('value', () => {
          expect(component).to.have.property('value');
        });

        it('threshold', () => {
          expect(component).to.have.property('threshold');
        });

        it('start()', () => {
          expect(component.start).to.be.a('function');
        });

        it('setScale()', () => {
          expect(component.setScale).to.be.a('function');
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

      describe('compass', () => {
        let component;

        beforeEach(() => {
          component = jsInterpreter.globalProperties.compass;
        });

        it('start()', () => {
          expect(component.start).to.be.a('function');
        });
        it('getHeading()', () => {
          expect(component.getHeading).to.be.a('function');
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
