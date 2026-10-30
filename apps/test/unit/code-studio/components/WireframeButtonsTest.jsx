import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import SendToPhone from '@cdo/apps/code-studio/components/SendToPhone';
import WireframeButtons from '@cdo/apps/code-studio/components/WireframeButtons';

import {expect} from '../../../util/deprecatedChai'; // eslint-disable-line no-restricted-imports

// Each button is identified by its icon, which is unique per button. The buttons
// are MUI Buttons, so "Make my own" and "View code" render as anchors (they take
// an href) while "Send to phone" renders as a button (it takes an onClick).
function findIcon(wrapper, iconName) {
  return wrapper
    .find(FontAwesomeV6Icon)
    .filterWhere(n => n.prop('iconName') === iconName);
}

describe('WireframeButtons', () => {
  let wrapper;

  beforeEach(() => {
    jest
      .spyOn(SendToPhone.prototype, 'maskPhoneInput')
      .mockClear()
      .mockImplementation();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
      wrapper = undefined;
    }

    SendToPhone.prototype.maskPhoneInput.mockRestore();
  });

  describe('Send To Phone button', () => {
    it('shows SendToPhone controls when clicked', () => {
      wrapper = mount(
        <WireframeButtons
          channelId="fake-channel-id"
          appType="applab"
          isLegacyShare={false}
        />
      );
      expect(wrapper.find(SendToPhone)).to.be.empty;

      findIcon(wrapper, 'mobile-screen-button')
        .closest('button')
        .simulate('click');
      expect(wrapper.find(SendToPhone)).not.to.be.empty;
    });
  });

  describe('Make My Own button', () => {
    it('legacy shares have a different Make My Own url', () => {
      wrapper = mount(
        <WireframeButtons
          channelId="fake-channel-id"
          appType="artist"
          isLegacyShare={true}
        />
      );

      const makeMyOwnUrl = () =>
        findIcon(wrapper, 'pen-to-square').closest('a').prop('href');

      wrapper.setProps({isLegacyShare: true});
      expect(makeMyOwnUrl()).to.equal('/s/artist');

      wrapper.setProps({isLegacyShare: false});
      expect(makeMyOwnUrl()).to.equal('/p/artist');
    });
  });

  describe('View Code button', () => {
    function mountForAppType(appType) {
      return mount(
        <WireframeButtons
          channelId="fake-channel-id"
          appType={appType}
          isLegacyShare={false}
        />
      );
    }

    ['applab', 'gamelab', 'makerlab'].forEach(appType => {
      it(`appears for ${appType}`, () => {
        wrapper = mountForAppType(appType);
        expect(findIcon(wrapper, 'code')).not.to.be.empty;
      });
    });

    ['artist', 'playlab', 'weblab'].forEach(appType => {
      it(`does not appear for ${appType}`, () => {
        wrapper = mountForAppType(appType);
        expect(findIcon(wrapper, 'code')).to.be.empty;
      });
    });
  });
});
