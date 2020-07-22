import {expect} from '../../../../../../util/deprecatedChai';
import MicroBitBoard from '@cdo/apps/lib/kits/maker/boards/microBit/MicroBitBoard';
import {MicrobitStubBoard} from '../makeStubBoard';
import sinon from 'sinon';
import {itImplementsTheMakerBoardInterface} from '../MakerBoardTest';
import _ from 'lodash';
import {
  EXTERNAL_PINS,
  MB_COMPONENT_COUNT,
  MB_COMPONENTS
} from '@cdo/apps/lib/kits/maker/boards/microBit/MicroBitConstants';
import ExternalLed from '@cdo/apps/lib/kits/maker/boards/microBit/ExternalLed';
import ExternalButton from '@cdo/apps/lib/kits/maker/boards/microBit/ExternalButton';
import CapacitiveTouchSensor from '@cdo/apps/lib/kits/maker/boards/microBit/CapacitiveTouchSensor';

describe('MicroBitBoard', () => {
  let board;

  beforeEach(() => {
    // Construct a board to test on
    window.SerialPort = {};
    board = new MicroBitBoard();
    board.boardClient_ = new MicrobitStubBoard();
  });

  afterEach(() => {
    board = undefined;
  });

  describe('Maker Board Interface', () => {
    itImplementsTheMakerBoardInterface(MicroBitBoard, board => {
      sinon.stub(board.boardClient_, 'connect').callsFake(() => {
        board.boardClient_.myPort = {write: () => {}};
        sinon.stub(board.boardClient_.myPort, 'write');
      });

      sinon.stub(board.boardClient_, 'analogRead').callsArgWith(1, 0);
      sinon.stub(board.boardClient_, 'digitalRead').callsArgWith(1, 0);
    });

    /**
     * After installing on the interpreter, test that the components and
     * component constructors are available from the interpreter
     */
    describe('Micro Bit components accessible from interpreter', () => {
      let jsInterpreter;
      let board;

      beforeEach(() => {
        board = new MicroBitBoard();
        sinon.stub(board.boardClient_, 'connect').callsFake(() => {
          board.boardClient_.myPort = {write: () => {}};
          sinon.stub(board.boardClient_.myPort, 'write');
        });

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

            it('isPressed', () =>
              expect(component.isPressed).to.be.a('boolean'));
            it('holdtime', () => expect(component.holdtime).to.be.a('number'));
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

          it('setRange()', () => {
            expect(component.setRange).to.be.a('function');
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

        describe('compass', () => {
          let component;

          beforeEach(() => {
            component = jsInterpreter.globalProperties.compass;
          });

          it('start()', () => expect(component.start).to.be.a('function'));
          it('getHeading()', () =>
            expect(component.getHeading).to.be.a('function'));
        });

        describe('board', () => {
          it('exists', () => {
            expect(jsInterpreter.globalProperties).to.have.ownProperty('board');
          });
        });
      });
    });
  });

  describe(`connect()`, () => {
    it('initializes a set of components', () => {
      return board.connect().then(() => {
        expect(Object.keys(board.prewiredComponents_)).to.have.length(
          MB_COMPONENT_COUNT
        );
        expect(board.prewiredComponents_.board).to.be.a('object');
        expect(board.prewiredComponents_.ledScreen).to.be.a('object');
        expect(board.prewiredComponents_.tempSensor).to.be.a('object');
        expect(board.prewiredComponents_.accelerometer).to.be.a('object');
        expect(board.prewiredComponents_.compass).to.be.a('object');
        expect(board.prewiredComponents_.buttonA).to.be.a('object');
        expect(board.prewiredComponents_.buttonB).to.be.a('object');
        expect(board.prewiredComponents_.lightSensor).to.be.a('object');
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
        expect(accelerometerSpy).to.have.been.calledOnce;
      });
    });
  });

  describe(`boardConnected()`, () => {
    it('returns false at first', () => {
      expect(board.boardConnected()).to.be.false;
    });

    it('returns true after connecting', () => {
      return board.connect().then(() => {
        expect(board.boardConnected()).to.be.true;
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
        expect(pinModeSpy).to.have.been.calledWith(pin, arg2);
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
        expect(digitalWriteSpy).to.have.been.calledWith(pin, arg2);
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
        expect(digitalReadSpy).to.have.been.calledWith(pin, arg2);
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
        expect(analogWriteSpy).to.have.been.calledWith(pin, arg2);
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
        expect(analogReadSpy).to.have.been.calledWith(pin, arg2);
      });
    });
  });

  describe(`createLed(pin)`, () => {
    it('makes an LED controller', () => {
      return board.connect().then(() => {
        const pin = 13;
        const newLed = board.createLed(pin);
        expect(newLed).to.be.an.instanceOf(ExternalLed);
      });
    });
  });

  describe(`createButton(pin)`, () => {
    it('makes a button controller', () => {
      return board.connect().then(() => {
        const pin = 13;
        const newButton = board.createButton(pin);
        expect(newButton).to.be.an.instanceOf(ExternalButton);
      });
    });

    it('configures the controller as a pullup if passed an external pin', () => {
      return board.connect().then(() => {
        EXTERNAL_PINS.forEach(pin => {
          const newButton = board.createButton(pin);
          expect(newButton.pullup).to.be.true;
        });
      });
    });

    it('does not configure the controller as a pullup if passed a non-external pin', () => {
      return board.connect().then(() => {
        _.range(21)
          .filter(pin => !EXTERNAL_PINS.includes(pin))
          .forEach(pin => {
            const newButton = board.createButton(pin);
            expect(newButton.pullup).to.be.false;
          });
      });
    });
  });

  describe(`createCapacitiveTouchSensor(pin)`, () => {
    it('makes a CapacitiveTouchSensor controller', () => {
      return board.connect().then(() => {
        const pin = 1;
        const newSensor = board.createCapacitiveTouchSensor(pin);
        expect(newSensor).to.be.an.instanceOf(CapacitiveTouchSensor);
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
        expect(ledScreenSpy).to.have.been.calledOnce;
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
          expect(resetSpy).to.have.been.calledOnce;
        });
    });

    it('turns off any created Leds', () => {
      return board.connect().then(() => {
        const led1 = board.createLed(0);
        const led2 = board.createLed(1);
        sinon.spy(led1, 'off');
        sinon.spy(led2, 'off');

        expect(led1.off).not.to.have.been.called;
        expect(led2.off).not.to.have.been.called;

        return board.destroy().then(() => {
          expect(led1.off).to.have.been.calledOnce;
          expect(led2.off).to.have.been.calledOnce;
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
