import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedCodeReviewGroupsStatusToggle} from '@cdo/apps/templates/codeReviewGroups/CodeReviewGroupsStatusToggle';

describe('Code Review Groups Status Toggle', () => {
  let setCodeReviewExpiration, fakeSectionId;
  beforeEach(() => {
    setCodeReviewExpiration = () => {};
    fakeSectionId = 1;
  });

  it('renders enable toggle if code review expiration date is null', () => {
    let wrapper = mount(
      <UnconnectedCodeReviewGroupsStatusToggle
        codeReviewExpiresAt={null}
        sectionId={fakeSectionId}
        setCodeReviewExpiration={setCodeReviewExpiration}
      />
    );
    const toggle = wrapper.find('ToggleSwitch');
    expect(toggle.prop('isToggledOn')).to.be.false;
    // expect to not find the enabled message
    expect(wrapper.find('p')).to.have.lengthOf(0);
  });

  it('renders enable toggle if code review expiration date is before today', () => {
    const expiration = Date.now() - 1000;
    let wrapper = mount(
      <UnconnectedCodeReviewGroupsStatusToggle
        codeReviewExpiresAt={expiration}
        sectionId={fakeSectionId}
        setCodeReviewExpiration={setCodeReviewExpiration}
      />
    );
    const toggle = wrapper.find('ToggleSwitch');
    expect(toggle.prop('isToggledOn')).to.be.false;
  });

  it('renders disable toggle if code review expiration date is after today', () => {
    const expiration = Date.now() + 60000;
    let wrapper = mount(
      <UnconnectedCodeReviewGroupsStatusToggle
        codeReviewExpiresAt={expiration}
        sectionId={fakeSectionId}
        setCodeReviewExpiration={setCodeReviewExpiration}
      />
    );
    const toggle = wrapper.find('ToggleSwitch');
    expect(toggle.prop('isToggledOn')).to.be.true;
    // expect to see enabled message
    const enabledMessage = wrapper.find('p').at(0).text();
    const expectedEnabledMessage =
      'Code review will be automatically disabled in 1 days. To reset this time, disable and re-enable code review.';
    expect(enabledMessage).to.equal(expectedEnabledMessage);
  });
});
