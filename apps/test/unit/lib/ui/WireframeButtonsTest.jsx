import React from 'react';
import {mount} from 'enzyme';
import {replaceOnWindow, restoreOnWindow} from "../../../util/testUtils";
import WireframeButtons from '@cdo/apps/lib/ui/WireframeButtons';

describe('WireframeButtons', () => {
  let wrapper;

  beforeEach(() => {
    replaceOnWindow('dashboard', {});
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
      wrapper = undefined;
    }

    restoreOnWindow('dashboard');
  });

  it('renders', () => {
    wrapper = mount(
      <WireframeButtons
        channelId="fake-channel-id"
        appType="applab"
        isLegacyShare={false}
      />
    );
  });
});
