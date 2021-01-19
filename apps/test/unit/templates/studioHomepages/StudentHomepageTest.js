import React from 'react';
import {assert} from 'chai';
import {shallow} from 'enzyme';
import StudentHomepage from '@cdo/apps/templates/studioHomepages/StudentHomepage';
import HeaderBanner from '@cdo/apps/templates/HeaderBanner';
import StudentSections from '@cdo/apps/templates/studioHomepages/StudentSections';
import {courses, topCourse, joinedSections} from './homepagesTestData';

describe('StudentHomepage', () => {
  const TEST_PROPS = {
    courses,
    topCourse,
    sections: joinedSections,
    codeOrgUrlPrefix: 'http://localhost:3000',
    studentId: 123,
    isEnglish: true
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

  it('shows a StudentSections component', () => {
    const wrapper = shallow(<StudentHomepage {...TEST_PROPS} />);
    const studentSections = wrapper.find(StudentSections);
    assert.deepEqual(studentSections.props(), {
      initialSections: joinedSections
    });
  });

  it('shows the special announcement for English', () => {
    const wrapper = shallow(
      <StudentHomepage {...TEST_PROPS} isEnglish={true} />
    );
    assert(wrapper.find('SpecialAnnouncement').exists());
  });

  it('does not show the special announcement for non-English', () => {
    const wrapper = shallow(
      <StudentHomepage {...TEST_PROPS} isEnglish={false} />
    );
    assert.isFalse(wrapper.find('SpecialAnnouncement').exists());
  });
});
