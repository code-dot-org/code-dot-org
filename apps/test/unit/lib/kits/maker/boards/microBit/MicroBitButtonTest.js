import {MicrobitStubBoard} from '../makeStubBoard';
import {expect} from '../../../../../../util/deprecatedChai';
import {EventEmitter} from 'events';
import sinon from 'sinon';
import MicroBitButton from '@cdo/apps/lib/kits/maker/boards/microBit/MicroBitButton';

describe('MicroBitButton', function() {
  it('is an event emitter component', function() {
    const button = new MicroBitButton({
      mb: new MicrobitStubBoard(),
      pin: 0
    });
    expect(button).to.be.an.instanceOf(EventEmitter);
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

  describe('holdtime', () => {
    let button;

    beforeEach(() => {
      button = new MicroBitButton({
        mb: new MicrobitStubBoard(),
        pin: 0
      });
    });

    it('is a readonly property', () => {
      const descriptor = Object.getOwnPropertyDescriptor(button, 'holdtime');
      expect(descriptor.get).to.be.a('function');
      expect(descriptor.set).to.be.undefined;
      expect(() => {
        button.holdtime = 600;
      }).to.throw();
    });

    it('returns the default value, 500 ms', () => {
      expect(button.holdtime).to.equal(500);
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
