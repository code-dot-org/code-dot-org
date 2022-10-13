import React from 'react';
import {assert} from 'chai';
import {shallow} from 'enzyme';
import StudentHomepage from '@cdo/apps/templates/studioHomepages/StudentHomepage';
import HeaderBanner from '@cdo/apps/templates/HeaderBanner';
import {courses, topCourse, joinedSections} from './homepagesTestData';
import Notification from '@cdo/apps/templates/Notification';
import i18n from '@cdo/locale';

describe('StudentHomepage', () => {
  const TEST_PROPS = {
    courses,
    topCourse,
    sections: joinedSections,
    codeOrgUrlPrefix: 'http://localhost:3000',
    studentId: 123,
    showVerifiedTeacherWarning: false
  };

  it('shows a non-extended Header Banner that says My Dashboard', () => {
    const wrapper = shallow(<StudentHomepage {...TEST_PROPS} />);
    const headerBanner = wrapper.find(HeaderBanner);
    assert.deepEqual(headerBanner.props(), {
      headingText: 'My Dashboard',
      short: true,
      backgroundUrl: '/shared/images/banners/teacher-homepage-hero.jpg'
    });
  });

  it('references a ProtectedStatefulDiv for flashes', () => {
    const wrapper = shallow(<StudentHomepage {...TEST_PROPS} />);
    assert(wrapper.find('ProtectedStatefulDiv').exists());
  });

  it('shows RecentCourses component', () => {
    const wrapper = shallow(<StudentHomepage {...TEST_PROPS} />);
    const recentCourses = wrapper.find('RecentCourses');
    assert.deepEqual(recentCourses.props(), {
      courses: courses,
      topCourse: topCourse,
      isTeacher: false,
      hasFeedback: false
    });
  });

  it('shows ProjectWidgetWithData component', () => {
    const wrapper = shallow(<StudentHomepage {...TEST_PROPS} />);
    assert(wrapper.find('ProjectWidgetWithData').exists());
  });

  it('shows a JoinSectionArea component', () => {
    const wrapper = shallow(<StudentHomepage {...TEST_PROPS} />);
    const joinSectionArea = wrapper.find('JoinSectionArea');
    assert.deepEqual(joinSectionArea.props(), {
      initialJoinedStudentSections: joinedSections
    });
  });

  it('displays a notification for verified teacher permissions if showVerifiedTeacherWarning is true', () => {
    const wrapper = shallow(
      <StudentHomepage {...TEST_PROPS} showVerifiedTeacherWarning={true} />
    );
    const notification = wrapper.find(Notification);
    assert(notification.exists());
    assert.equal(
      notification.props().notice,
      i18n.studentAsVerifiedTeacherWarning()
    );
  });
});
