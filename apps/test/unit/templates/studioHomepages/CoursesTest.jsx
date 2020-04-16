import React from 'react';
import {assert} from 'chai';
import {shallow} from 'enzyme';
import Courses from '@cdo/apps/templates/studioHomepages/Courses';
import HeaderBanner from '@cdo/apps/templates/HeaderBanner';

describe('Courses', () => {
  const TEST_PROPS = {
    isEnglish: true,
    isTeacher: true,
    isSignedOut: true,
    linesCount: '0',
    studentsCount: '0',
    modernElementaryCoursesAvailable: true
  };

  it('shows a short banner when signed in', () => {
    const wrapper = shallow(<Courses {...TEST_PROPS} isSignedOut={false} />);
    const header = wrapper.find(HeaderBanner);
    assert.isTrue(header.prop('short'));
    assert.isUndefined(header.prop('description'));
  });

  it('shows a long banner when signed out', () => {
    const wrapper = shallow(<Courses {...TEST_PROPS} isSignedOut={true} />);
    const header = wrapper.find(HeaderBanner);
    assert.isFalse(header.prop('short'));
    assert.isString(header.prop('description'));
  });
});
