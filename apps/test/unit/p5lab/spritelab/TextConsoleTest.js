import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import TextConsole, {
  AUTO_CLOSE_TIME,
} from '@cdo/apps/p5lab/spritelab/TextConsole';

describe('Sprite Lab Text Console', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(<TextConsole consoleMessages={[]} />);
  });

  it('is initially closed', () => {
    expect(wrapper.state().open).toBe(false);
  });

  it('and the button text is +', () => {
    const button = wrapper.findWhere(node => {
      return node.type() === 'button' && node.text() === '+';
    });
    expect(button).toHaveLength(1);
  });

  describe('after a line is added', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      wrapper.setProps({consoleMessages: ['hello world2']});
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('opens', () => {
      expect(wrapper.state().open).toBe(true);
    });

    it('the button text is -', () => {
      const button = wrapper.findWhere(node => {
        return node.type() === 'button' && node.text() === '-';
      });
      expect(button).toHaveLength(1);
    });

    it('closes after AUTO_CLOSE_TIME ms', () => {
      jest.advanceTimersByTime(AUTO_CLOSE_TIME);
      expect(wrapper.state().open).toBe(false);

      const button = wrapper.findWhere(node => {
        return node.type() === 'button' && node.text() === '+';
      });
      expect(button).toHaveLength(1);
    });

    describe('and the console is toggled', () => {
      beforeEach(() => {
        wrapper.instance().toggleConsole();
      });

      it('closes', () => {
        expect(wrapper.state().open).toBe(false);
      });

      it('the button becomes visible', () => {
        expect(wrapper.instance().getButtonStyle().display).not.toBe('none');
      });

      it('opens when toggled again', () => {
        wrapper.instance().toggleConsole(AUTO_CLOSE_TIME);
        expect(wrapper.state().open).toBe(true);
      });

      it('opens and stays open when the button is clicked', () => {
        wrapper.instance().toggleConsole();
        expect(wrapper.state().open).toBe(true);
        jest.advanceTimersByTime(AUTO_CLOSE_TIME * 2);
        expect(wrapper.state().open).toBe(true);
      });
    });
  });
});
