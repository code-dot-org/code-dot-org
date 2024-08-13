import {assert} from 'chai'; // eslint-disable-line no-restricted-imports
import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import SignUpPanel from '@cdo/apps/code-studio/pd/workshop_dashboard/SignUpPanel';

describe('SignUpPanel', () => {
  it('displays a sign-up URL', () => {
    const workshopId = 5;
    const wrapper = mount(<SignUpPanel workshopId={workshopId} />);
    assert.include(wrapper.text(), `/pd/workshops/${workshopId}/enroll`);
  });
});
