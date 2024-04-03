import {shallow} from 'enzyme';
import cookies from 'js-cookie';
import React from 'react';

import {UnconnectedSwipePrompt as SwipePrompt} from '@cdo/apps/templates/SwipePrompt';

import {expect} from '../../util/reconfiguredChai';

const visibleOverlayProps = {
  buttonsAreVisible: true,
  buttonsAreDisabled: false,
  hasBeenDismissed: false,
  onDismiss: () => {},
  dismissAction: '',
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
      expect(wrapper.find('svg').exists()).to.be.true;
    });

    it('when the override is set', () => {
      jest.spyOn(cookies, 'get').mockClear().mockReturnValue(true);
      jest.spyOn(instance, 'touchSupported').mockClear().mockReturnValue(true);
      jest
        .spyOn(instance, 'swipeOverlayOverrideSet')
        .mockClear()
        .mockReturnValue(true);
      wrapper.setProps({}); // force a re-render
      expect(wrapper.find('svg').exists()).to.be.true;
      cookies.get.mockRestore();
    });

    it('and hides when dismissed', () => {
      jest
        .spyOn(instance, 'hideOverlayCookieSet')
        .mockClear()
        .mockReturnValue(false);
      jest.spyOn(instance, 'touchSupported').mockClear().mockReturnValue(true);
      wrapper.setProps({}); // force a re-render
      expect(wrapper.find('svg').exists()).to.be.true;
      wrapper.setProps({hasBeenDismissed: true});
      expect(wrapper.find('svg').exists()).to.be.false;
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
      expect(wrapper.find('svg').exists()).to.be.false;
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
      expect(wrapper.find('svg').exists()).to.be.false;
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
        expect(wrapper.find('svg').exists()).to.be.false;
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
        expect(wrapper.find('svg').exists()).to.be.false;
      });
    });
  });
});
