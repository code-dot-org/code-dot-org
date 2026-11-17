import NotificationBanner from '@code-dot-org/component-library/notification-banner';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import RequiresVerifiedTeacherAccessNotification from '@cdo/apps/templates/courseOverview/RequiresVerifiedTeacherAccessNotification';
import {VERIFIED_RESOURCES_URL} from '@cdo/apps/templates/courseOverview/VerifiedResourcesNotification';

describe('RequiresVerifiedTeacherAccessNotification', () => {
  it('renders an undismissable error banner linking to the verification article', () => {
    const wrapper = shallow(<RequiresVerifiedTeacherAccessNotification />);
    const banner = wrapper.find(NotificationBanner).first();

    expect(banner.prop('variant')).toBe('error');
    expect(banner.prop('onClose')).toBeUndefined();
    expect(banner.prop('description')).toBe(
      'This course is only available to verified teachers.'
    );
    expect(shallow(banner.prop('actions')).prop('href')).toBe(
      VERIFIED_RESOURCES_URL
    );
  });
});
