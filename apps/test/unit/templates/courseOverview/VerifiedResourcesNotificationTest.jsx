import {expect} from '../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import VerifiedResourcesNotification from '@cdo/apps/templates/courseOverview/VerifiedResourcesNotification';

describe('VerifiedResourcesNotification', () => {
  const defaultProps = {
    width: 700,
    inLesson: false
  };

  it('renders course details description when notification not in lesson', () => {
    const wrapper = shallow(
      <VerifiedResourcesNotification {...defaultProps} />
    );

    expect(
      wrapper
        .find('Connect(Notification)')
        .first()
        .props().details
    ).to.equal(
      'This course provides extra resources which are only available to verified teachers.'
    );
  });

  it('renders lesson details description when notification in lesson', () => {
    const wrapper = shallow(
      <VerifiedResourcesNotification {...defaultProps} inLesson={true} />
    );

    expect(
      wrapper
        .find('Connect(Notification)')
        .first()
        .props().details
    ).to.equal(
      'This lesson contains extra resources or levels which are only available to verified teachers.'
    );
  });
});
