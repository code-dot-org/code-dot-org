import {expect} from '../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import {UnconnectedSwipePrompt as SwipePrompt} from '@cdo/apps/templates/SwipePrompt';
import sinon from 'sinon';
import cookies from 'js-cookie';

const visibleOverlayProps = {
  buttonsAreVisible: true,
  buttonsAreDisabled: false,
  hasBeenDismissed: false,
  onDismiss: () => {},
  dismissAction: ''
};

describe('SwipePrompt', () => {
  let wrapper, instance;

  describe('is visible', () => {
    beforeEach(() => {
      wrapper = shallow(<SwipePrompt {...visibleOverlayProps} />);
      instance = wrapper.instance();
    });

    it('when the cookie is not set', () => {
      sinon.stub(instance, 'hideOverlayCookieSet').returns(false);
      sinon.stub(instance, 'touchSupported').returns(true);
      wrapper.setProps({}); // force a re-render
      expect(wrapper.find('svg').exists()).to.be.true;
    });

    it('when the override is set', () => {
      sinon.stub(cookies, 'get').returns(true);
      sinon.stub(instance, 'touchSupported').returns(true);
      sinon.stub(instance, 'swipeOverlayOverrideSet').returns(true);
      wrapper.setProps({}); // force a re-render
      expect(wrapper.find('svg').exists()).to.be.true;
      cookies.get.restore();
    });

    it('and hides when dismissed', () => {
      sinon.stub(instance, 'hideOverlayCookieSet').returns(false);
      sinon.stub(instance, 'touchSupported').returns(true);
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
      sinon.stub(instance, 'hideOverlayCookieSet').returns(false);
      sinon.stub(instance, 'touchSupported').returns(true);
      wrapper.setProps({}); // force a re-render
      expect(wrapper.find('svg').exists()).to.be.false;
    });

    it('if buttons are disabled', () => {
      const hiddenProps = {...visibleOverlayProps, buttonsAreDisabled: true};
      wrapper = shallow(<SwipePrompt {...hiddenProps} />);
      instance = wrapper.instance();
      sinon.stub(instance, 'hideOverlayCookieSet').returns(false);
      sinon.stub(instance, 'touchSupported').returns(true);
      wrapper.setProps({}); // force a re-render
      expect(wrapper.find('svg').exists()).to.be.false;
    });

    describe('when buttons are usable', () => {
      beforeEach(() => {
        wrapper = shallow(<SwipePrompt {...visibleOverlayProps} />);
        instance = wrapper.instance();
      });

      it('if the cookie has been set', () => {
        sinon.stub(instance, 'hideOverlayCookieSet').returns(true);
        sinon.stub(instance, 'touchSupported').returns(true);
        wrapper.setProps({}); // force a re-render
        expect(wrapper.find('svg').exists()).to.be.false;
      });

      it('if touch is not supported', () => {
        sinon.stub(instance, 'hideOverlayCookieSet').returns(false);
        sinon.stub(instance, 'swipeOverlayOverrideSet').returns(false);
        sinon.stub(instance, 'touchSupported').returns(false);
        wrapper.setProps({}); // force a re-render
        expect(wrapper.find('svg').exists()).to.be.false;
      });
    });
  });
});
