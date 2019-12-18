/** @file Tests for our johnny-five Button wrapper */
import _ from 'lodash';
import {expect} from '../../../../util/deprecatedChai';
import five from '@code-dot-org/johnny-five';
import makeStubBoard from './makeStubBoard';
import {PlaygroundButton as Button} from '@cdo/apps/lib/kits/maker/Button';
import {EXTERNAL_PINS} from '@cdo/apps/lib/kits/maker/PlaygroundConstants';

describe('Button', function() {
  it('is a johnny-five Button component', function() {
    const button = new Button({
      board: makeStubBoard(),
      pin: 0
    });
    expect(button).to.be.an.instanceOf(five.Button);
  });

  describe('isPressed', () => {
    let button;

    beforeEach(() => {
      button = new Button({
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
      const button = new Button({
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
        const button = new Button({
          board: makeStubBoard(),
          pin
        });
        expect(button.pullup).to.be.false;
      });
  });
});
