import {EventEmitter} from 'events';

import MicroBitButton from '@cdo/apps/maker/boards/microBit/MicroBitButton';
import {MBFirmataClientStub} from '@cdo/apps/maker/util/makeStubBoard';

describe('MicroBitButton', function () {
  it('is an event emitter component', function () {
    const button = new MicroBitButton({
      mb: new MBFirmataClientStub(),
      pin: 0,
    });
    expect(button).toBeInstanceOf(EventEmitter);
  });

  describe('isPressed', () => {
    let button;

    beforeEach(() => {
      button = new MicroBitButton({
        mb: new MBFirmataClientStub(),
        pin: 0,
      });
    });

    it('is a readonly property', () => {
      const descriptor = Object.getOwnPropertyDescriptor(button, 'isPressed');
      expect(descriptor.get).toBeInstanceOf(Function);
      expect(descriptor.set).toBeUndefined();
      expect(() => {
        button.isPressed = true;
      }).toThrow();
    });

    it('returns true when pressed and false when released', () => {
      button.buttonEvents[1]++; // record a 'press down' event
      expect(button.isPressed).toBe(true);

      button.buttonEvents[2]++; // record a 'release up' event
      expect(button.isPressed).toBe(false);
    });
  });

  describe('holdtime', () => {
    let button;

    beforeEach(() => {
      button = new MicroBitButton({
        mb: new MBFirmataClientStub(),
        pin: 0,
      });
    });
    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('is a readonly property', () => {
      const descriptor = Object.getOwnPropertyDescriptor(button, 'holdtime');
      expect(descriptor.get).toBeInstanceOf(Function);
      expect(descriptor.set).toBeUndefined();
      expect(() => {
        button.holdtime = 600;
      }).toThrow();
    });

    it('returns the default value, 500 ms', () => {
      expect(button.holdtime).toBe(500);
    });
  });

  describe('emitsEvent', () => {
    it('emits the corresponding event and updates states when board receives event', () => {
      let boardClient = new MBFirmataClientStub();
      let button = new MicroBitButton({
        mb: boardClient,
        pin: 0,
      });

      let emitSpy = jest.spyOn(button, 'emit').mockClear();

      boardClient.receivedEvent(0, 1);
      expect(button.isPressed).toBe(true);
      expect(emitSpy).toHaveBeenCalledTimes(1);
      expect(emitSpy).toHaveBeenCalledWith('down');

      boardClient.receivedEvent(0, 2);
      expect(button.isPressed).toBe(false);
      expect(emitSpy).toHaveBeenCalledTimes(2);
      expect(emitSpy).toHaveBeenCalledWith('up');
    });
  });
});
