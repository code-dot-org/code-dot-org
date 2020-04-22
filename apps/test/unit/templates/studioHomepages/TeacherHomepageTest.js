import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {assert} from 'chai';
import TeacherHomepage from '@cdo/apps/templates/studioHomepages/TeacherHomepage';
import TeacherSections from '@cdo/apps/templates/studioHomepages/TeacherSections';
import {courses, topCourse} from './homepagesTestData';

describe('TeacherHomepage', () => {
  const TEST_PROPS = {
    announcements: [],
    courses,
    topCourse,
    codeOrgUrlPrefix: 'http://localhost:3000',
    joinedSections: [],
    isEnglish: true,
    showCensusBanner: false
  };

  let server;
  const successResponse = () => [
    200,
    {'Content-Type': 'application/json'},
    JSON.stringify({})
  ];
  beforeEach(() => {
    server = sinon.fakeServer.create();
    server.respondWith('POST', '/dashboardapi/courses', successResponse());
    server.respondWith('POST', '/dashboardapi/sections', successResponse());
  });
  afterEach(() => server.restore());

  it('shows a non-extended Header Banner that says My Dashboard', () => {
    const wrapper = shallow(<TeacherHomepage {...TEST_PROPS} />);
    const headerBanner = wrapper.find('Connect(HeaderBanner)');
    assert.deepEqual(headerBanner.props(), {
      headingText: 'My Dashboard',
      short: true
    });
  });

  it('references 2 ProtectedStatefulDivs', () => {
    const wrapper = shallow(<TeacherHomepage {...TEST_PROPS} />);
    assert.lengthOf(wrapper.find('ProtectedStatefulDiv'), 2);
  });

  it('renders a TeacherSections component', () => {
    const wrapper = shallow(<TeacherHomepage {...TEST_PROPS} />);
    assert(wrapper.containsMatchingElement(<TeacherSections />));
  });

  it('renders a StudentSections component', () => {
    const wrapper = shallow(<TeacherHomepage {...TEST_PROPS} />);
    assert(wrapper.find('StudentSections').exists());
  });

  it('renders a RecentCourses component', () => {
    const wrapper = shallow(<TeacherHomepage {...TEST_PROPS} />);
    const recentCourses = wrapper.find('RecentCourses');
    assert.deepEqual(recentCourses.props(), {
      showAllCoursesLink: true,
      isTeacher: true,
      hasFeedback: false,
      courses: courses,
      topCourse: topCourse
    });
  });

  it('shows ProjectWidgetWithData component', () => {
    const wrapper = shallow(<TeacherHomepage {...TEST_PROPS} />);
    assert(wrapper.find('ProjectWidgetWithData').exists());
  });

  it('shows the special announcement for English', () => {
    const wrapper = shallow(
      <TeacherHomepage {...TEST_PROPS} isEnglish={true} />
    );
    assert(wrapper.find('SpecialAnnouncement').exists());
  });

  it('does not show the special announcement for non-English', () => {
    const wrapper = shallow(
      <TeacherHomepage {...TEST_PROPS} isEnglish={false} />
    );
    assert.isFalse(wrapper.find('SpecialAnnouncement').exists());
  });
});
