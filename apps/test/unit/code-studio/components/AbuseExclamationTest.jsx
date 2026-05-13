import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import AbuseExclamation from '@cdo/apps/code-studio/components/AbuseExclamation';

describe('AbuseExclamation', () => {
  it('renders AbuseExclamation components', () => {
    const wrapper = shallow(
      <AbuseExclamation
        i18n={{
          tos: 'terms of service',
          contact_us: 'contact us',
          edit_project: 'edit project',
          go_to_code_studio: 'go to code studio',
        }}
        isOwner={false}
        channelId="test-channel-id"
      />
    );
    expect(wrapper.find('AbuseError').length).toBe(1);
    expect(wrapper.find('AlertExclamation').length).toBe(1);
  });

  it('shows edit link if isOwner is true', () => {
    const wrapper = shallow(
      <AbuseExclamation
        i18n={{
          tos: 'terms of service',
          contact_us: 'contact us',
          edit_project: 'edit project',
          go_to_code_studio: 'go to code studio',
        }}
        isOwner={true}
      />
    );
    expect(wrapper.find('a').text()).toContain('edit project');
  });

  it('shows view link if canViewFlaggedProject is true', () => {
    const wrapper = shallow(
      <AbuseExclamation
        i18n={{
          tos: 'terms of service',
          contact_us: 'contact us',
          edit_project: 'edit project',
          view_project: 'view project',
          go_to_code_studio: 'go to code studio',
        }}
        isOwner={false}
        canViewFlaggedProject={true}
      />
    );
    expect(wrapper.find('a').text()).toContain('view project');
  });

  it('shows code studio link if isOwner is false', () => {
    const wrapper = shallow(
      <AbuseExclamation
        i18n={{
          tos: 'terms of service',
          contact_us: 'contact us',
          edit_project: 'edit project',
          go_to_code_studio: 'go to code studio',
        }}
        isOwner={false}
      />
    );
    expect(wrapper.find('a').text()).toContain('go to code studio');
  });
});
