import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../util/deprecatedChai';
import i18n from '@cdo/locale';
import WireframeButtons from '@cdo/apps/lib/ui/WireframeButtons';
import SendToPhone from '@cdo/apps/code-studio/components/SendToPhone';

describe('WireframeButtons', () => {
  let wrapper;

  beforeEach(() => {
    sinon.stub(SendToPhone.prototype, 'maskPhoneInput');
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
      wrapper = undefined;
    }

    SendToPhone.prototype.maskPhoneInput.restore();
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

      wrapper.find('.fa-mobile').simulate('click');
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

      wrapper.setProps({isLegacyShare: true});
      expect(wrapper).to.containMatchingElement(
        <span>
          <a className="WireframeButtons_button" href="/s/artist">
            <i className="fa fa-pencil-square-o" /> {i18n.makeMyOwn()}
          </a>
        </span>
      );

      wrapper.setProps({isLegacyShare: false});
      expect(wrapper).to.containMatchingElement(
        <span>
          <a className="WireframeButtons_button" href="/p/artist">
            <i className="fa fa-pencil-square-o" /> {i18n.makeMyOwn()}
          </a>
        </span>
      );
    });
  });

  describe('View Code button', () => {
    const VIEW_CODE_BUTTON_TEMPLATE = (
      <span>
        <a className="WireframeButtons_button">
          <i className="fa fa-code" /> {i18n.viewCode()}
        </a>
      </span>
    );

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
        expect(wrapper).to.containMatchingElement(VIEW_CODE_BUTTON_TEMPLATE);
      });
    });

    ['artist', 'playlab', 'weblab'].forEach(appType => {
      it(`does not appear for ${appType}`, () => {
        wrapper = mountForAppType(appType);
        expect(wrapper).not.to.containMatchingElement(
          VIEW_CODE_BUTTON_TEMPLATE
        );
      });
    });
  });
});
