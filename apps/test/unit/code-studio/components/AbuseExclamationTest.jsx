import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
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
        isOwner
      />
    );
    expect(wrapper.find('AbuseError').length).to.equal(1);
    expect(wrapper.find('AlertExclamation').length).to.equal(1);
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
        isOwner
      />
    );
    expect(wrapper.find('a').text()).to.contain('edit project');
  });

  it('shows code studio link if isOwener is false', () => {
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
    expect(wrapper.find('a').text()).to.contain('go to code studio');
  });
});
