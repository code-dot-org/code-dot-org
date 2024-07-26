/** @file Tests for our johnny-five Button wrapper */
import five from '@code-dot-org/johnny-five';
import _ from 'lodash';

import PlaygroundButton from '@cdo/apps/lib/kits/maker/boards/circuitPlayground/Button';
import {EXTERNAL_PINS} from '@cdo/apps/lib/kits/maker/boards/circuitPlayground/PlaygroundConstants';
import {makeCPBoardStub} from '@cdo/apps/lib/kits/maker/util/makeStubBoard';

describe('PlaygroundButton', function () {
  it('is a johnny-five Button component', function () {
    const button = new PlaygroundButton({
      board: makeCPBoardStub(),
      pin: 0,
    });
    expect(button).toBeInstanceOf(five.Button);
  });

  describe('isPressed', () => {
    let button;

    beforeEach(() => {
      button = new PlaygroundButton({
        board: makeCPBoardStub(),
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
  });

  it('becomes a pullup when assigned to an external pin', () => {
    EXTERNAL_PINS.forEach(pin => {
      const button = new PlaygroundButton({
        board: makeCPBoardStub(),
        pin,
      });
      expect(button.pullup).toBe(true);
    });
  });

  it('does not become a pullup when assigned to a non-external pin', () => {
    _.range(21)
      .filter(pin => !EXTERNAL_PINS.includes(pin))
      .forEach(pin => {
        const button = new PlaygroundButton({
          board: makeCPBoardStub(),
          pin,
        });
        expect(button.pullup).toBe(false);
      });
  });
});
