/** @file Tests for our johnny-five Button wrapper */
import _ from 'lodash';
import {expect} from '../../../../util/deprecatedChai';
import five from '@code-dot-org/johnny-five';
import {makeStubBoard, MicrobitStubBoard} from './makeStubBoard';
import {
  PlaygroundButton,
  MicroBitButton
} from '@cdo/apps/lib/kits/maker/Button';
import {EXTERNAL_PINS} from '@cdo/apps/lib/kits/maker/PlaygroundConstants';
import sinon from 'sinon';

describe('PlaygroundButton', function() {
  it('is a johnny-five Button component', function() {
    const button = new PlaygroundButton({
      board: makeStubBoard(),
      pin: 0
    });
    expect(button).to.be.an.instanceOf(five.Button);
  });

  describe('isPressed', () => {
    let button;

    beforeEach(() => {
      button = new PlaygroundButton({
        board: makeStubBoard(),
        pin: 0
      });
    });

    it('is a readonly property', () => {
      const descriptor = Object.getOwnPropertyDescriptor(button, 'isPressed');
      expect(descriptor.get).to.be.a('function');
      expect(descriptor.set).to.be.undefined;
      expect(() => {
        button.isPressed = true;
      }).to.throw();
    });
  });

  it('becomes a pullup when assigned to an external pin', () => {
    EXTERNAL_PINS.forEach(pin => {
      const button = new PlaygroundButton({
        board: makeStubBoard(),
        pin
      });
      expect(button.pullup).to.be.true;
    });
  });

  it('does not become a pullup when assigned to a non-external pin', () => {
    _.range(21)
      .filter(pin => !EXTERNAL_PINS.includes(pin))
      .forEach(pin => {
        const button = new PlaygroundButton({
          board: makeStubBoard(),
          pin
        });
        expect(button.pullup).to.be.false;
      });
  });
});

describe('MicroBitButton', function() {
  it('is a johnny-five Button component', function() {
    const button = new MicroBitButton({
      mb: new MicrobitStubBoard(),
      pin: 0
    });
    expect(button).to.be.an.instanceOf(five.Button);
  });

  describe('isPressed', () => {
    let button;

    beforeEach(() => {
      button = new MicroBitButton({
        mb: new MicrobitStubBoard(),
        pin: 0
      });
    });

    it('is a readonly property', () => {
      const descriptor = Object.getOwnPropertyDescriptor(button, 'isPressed');
      expect(descriptor.get).to.be.a('function');
      expect(descriptor.set).to.be.undefined;
      expect(() => {
        button.isPressed = true;
      }).to.throw();
    });

    it('returns true when pressed and false when released', () => {
      button.buttonEvents[1]++; // record a 'press down' event
      expect(button.isPressed).to.equal(true);

      button.buttonEvents[2]++; // record a 'release up' event
      expect(button.isPressed).to.equal(false);
    });
  });

  describe('emitsEvent', () => {
    it('emits the corresponding event and updates states when board receives event', () => {
      let boardClient = new MicrobitStubBoard();
      let button = new MicroBitButton({
        mb: boardClient,
        pin: 0
      });

      let emitSpy = sinon.spy(button, 'emit');

      boardClient.receivedEvent(0, 1);
      expect(button.isPressed).to.equal(true);
      expect(emitSpy).to.have.been.calledOnce;
      expect(emitSpy).to.have.been.calledWith('down');

      boardClient.receivedEvent(0, 2);
      expect(button.isPressed).to.equal(false);
      expect(emitSpy).to.have.been.calledTwice;
      expect(emitSpy).to.have.been.calledWith('up');
    });
  });
});
