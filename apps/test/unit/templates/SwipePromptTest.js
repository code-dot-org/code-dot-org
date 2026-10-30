import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import cookies from 'js-cookie';
import React from 'react';

import {UnconnectedSwipePrompt as SwipePrompt} from '@cdo/apps/templates/SwipePrompt';

const visibleOverlayProps = {
  buttonsAreVisible: true,
  buttonsAreDisabled: false,
  hasBeenDismissed: false,
  onDismiss: () => {},
};

describe('SwipePrompt', () => {
  let wrapper, instance;

  describe('is visible', () => {
    beforeEach(() => {
      wrapper = shallow(<SwipePrompt {...visibleOverlayProps} />);
      instance = wrapper.instance();
    });

    it('when the cookie is not set', () => {
      jest
        .spyOn(instance, 'hideOverlayCookieSet')
        .mockClear()
        .mockReturnValue(false);
      jest.spyOn(instance, 'touchSupported').mockClear().mockReturnValue(true);
      wrapper.setProps({}); // force a re-render
      expect(wrapper.find('svg').exists()).toBe(true);
    });

    it('when the override is set', () => {
      jest.spyOn(cookies, 'get').mockClear().mockReturnValue(true);
      jest.spyOn(instance, 'touchSupported').mockClear().mockReturnValue(true);
      jest
        .spyOn(instance, 'swipeOverlayOverrideSet')
        .mockClear()
        .mockReturnValue(true);
      wrapper.setProps({}); // force a re-render
      expect(wrapper.find('svg').exists()).toBe(true);
      cookies.get.mockRestore();
    });

    it('and hides when dismissed', () => {
      jest
        .spyOn(instance, 'hideOverlayCookieSet')
        .mockClear()
        .mockReturnValue(false);
      jest.spyOn(instance, 'touchSupported').mockClear().mockReturnValue(true);
      wrapper.setProps({}); // force a re-render
      expect(wrapper.find('svg').exists()).toBe(true);
      wrapper.setProps({hasBeenDismissed: true});
      expect(wrapper.find('svg').exists()).toBe(false);
    });
  });

  describe('is hidden', () => {
    it('if buttons are hidden', () => {
      const hiddenProps = {...visibleOverlayProps, buttonsAreVisible: false};
      wrapper = shallow(<SwipePrompt {...hiddenProps} />);
      instance = wrapper.instance();
      jest
        .spyOn(instance, 'hideOverlayCookieSet')
        .mockClear()
        .mockReturnValue(false);
      jest.spyOn(instance, 'touchSupported').mockClear().mockReturnValue(true);
      wrapper.setProps({}); // force a re-render
      expect(wrapper.find('svg').exists()).toBe(false);
    });

    it('if buttons are disabled', () => {
      const hiddenProps = {...visibleOverlayProps, buttonsAreDisabled: true};
      wrapper = shallow(<SwipePrompt {...hiddenProps} />);
      instance = wrapper.instance();
      jest
        .spyOn(instance, 'hideOverlayCookieSet')
        .mockClear()
        .mockReturnValue(false);
      jest.spyOn(instance, 'touchSupported').mockClear().mockReturnValue(true);
      wrapper.setProps({}); // force a re-render
      expect(wrapper.find('svg').exists()).toBe(false);
    });

    describe('when buttons are usable', () => {
      beforeEach(() => {
        wrapper = shallow(<SwipePrompt {...visibleOverlayProps} />);
        instance = wrapper.instance();
      });

      it('if the cookie has been set', () => {
        jest
          .spyOn(instance, 'hideOverlayCookieSet')
          .mockClear()
          .mockReturnValue(true);
        jest
          .spyOn(instance, 'touchSupported')
          .mockClear()
          .mockReturnValue(true);
        wrapper.setProps({}); // force a re-render
        expect(wrapper.find('svg').exists()).toBe(false);
      });

      it('if touch is not supported', () => {
        jest
          .spyOn(instance, 'hideOverlayCookieSet')
          .mockClear()
          .mockReturnValue(false);
        jest
          .spyOn(instance, 'swipeOverlayOverrideSet')
          .mockClear()
          .mockReturnValue(false);
        jest
          .spyOn(instance, 'touchSupported')
          .mockClear()
          .mockReturnValue(false);
        wrapper.setProps({}); // force a re-render
        expect(wrapper.find('svg').exists()).toBe(false);
      });
    });
  });
});
