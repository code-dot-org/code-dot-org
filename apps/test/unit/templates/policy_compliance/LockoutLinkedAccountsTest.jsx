import {mount, shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import LockoutLinkedAccounts from '@cdo/apps/templates/policy_compliance/LockoutLinkedAccounts';

import {hashString} from '../../../../src/utils';
import {expect} from '../../../util/deprecatedChai'; // eslint-disable-line no-restricted-imports

const DEFAULT_PROPS = {
  apiUrl: 'https://studio.code.org/api/foo',
  requestDate: new Date(),
  userEmail: hashString('student@test.com'),
};

const DEFAULT_DATE_OPTIONS = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
};

describe('LockoutLinkedAccounts', () => {
  it('renders the parent email box if the user does not have permission', () => {
    const wrapper = shallow(<LockoutLinkedAccounts {...DEFAULT_PROPS} />);
    expect(wrapper.find('#parent-email')).to.exist;
  });

  it('shows the parent email and timestamp for a pending permission request', () => {
    const wrapper = mount(
      <LockoutLinkedAccounts
        {...DEFAULT_PROPS}
        permissionStatus={'s'}
        pendingEmail={'parent@test.com'}
      />
    );
    const emailField = wrapper.find('#parent-email');
    expect(emailField).to.have.value('parent@test.com');

    const statusText = wrapper.find('#permission-status');
    expect(statusText).to.have.text('Pending');

    const lastEmailDate = wrapper.find('#lockout-last-email-date');
    expect(lastEmailDate).to.include.text(
      DEFAULT_PROPS.requestDate.toLocaleString('en-US', DEFAULT_DATE_OPTIONS)
    );
  });

  it('shows permission granted and hides the parent email input if the user has permission', () => {
    const wrapper = shallow(
      <LockoutLinkedAccounts
        {...DEFAULT_PROPS}
        permissionStatus={'g'}
        pendingEmail={'parent@test.com'}
      />
    );
    const statusText = wrapper.find('#permission-status');
    expect(statusText).to.have.text('Granted');
    expect(wrapper.find('#parent-email')).to.not.exist;
  });

  it('disables the submit button when the user enters their own email', () => {
    const wrapper = mount(
      <LockoutLinkedAccounts
        {...DEFAULT_PROPS}
        pendingEmail={'student@test.com'}
      />
    );

    const submitButton = wrapper.find('#lockout-submit').hostNodes();
    expect(submitButton).to.be.disabled();
  });
});
