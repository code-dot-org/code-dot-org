import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import TeacherDashboard from '@cdo/apps/templates/teacherDashboard/TeacherDashboard';
import {fakeCoursesWithProgress} from '@cdo/apps/templates/teacherDashboard/teacherDashboardTestHelpers';

const DEFAULT_PROPS = {
  studioUrlPrefix: 'https://studio.code.org',
  pegasusUrlPrefix: 'https://code.org',
  sectionId: 1,
  sectionName: 'My Section',
  location: {},
  studentCount: 5,
  coursesWithProgress: fakeCoursesWithProgress,
  sectionVersionId: 2,
};

describe('TeacherDashboard', () => {
  it('renders TeacherDashboardHeader', () => {
    const wrapper = shallow(<TeacherDashboard {...DEFAULT_PROPS} />);
    expect(wrapper.find('Connect(TeacherDashboardHeader)').length).toBe(1);
  });

  it('does not render TeacherDashboardHeader on /login_info', () => {
    const location = {pathname: '/login_info'};
    const wrapper = shallow(
      <TeacherDashboard {...DEFAULT_PROPS} location={location} />
    );
    expect(wrapper.find('Connect(TeacherDashboardHeader)').length).toBe(0);
  });

  it('does not render TeacherDashboardHeader on /standards_report', () => {
    const location = {pathname: '/standards_report'};
    const wrapper = shallow(
      <TeacherDashboard {...DEFAULT_PROPS} location={location} />
    );
    expect(wrapper.find('Connect(TeacherDashboardHeader)').length).toBe(0);
  });

  it('defaults to progress tab if no tab provided in route', () => {
    const location = {pathname: '/'};
    shallow(<TeacherDashboard {...DEFAULT_PROPS} location={location} />);
    expect(location.pathname).toBe('/progress');
  });

  it('defaults to progress tab if incorrect tab provided in route', () => {
    const location = {pathname: '/some_fake_path'};
    shallow(<TeacherDashboard {...DEFAULT_PROPS} location={location} />);
    expect(location.pathname).toBe('/progress');
  });

  it('defaults to manage students tab if no tab provided in route and section has 0 students', () => {
    const location = {pathname: '/'};
    shallow(
      <TeacherDashboard
        {...DEFAULT_PROPS}
        location={location}
        studentCount={0}
      />
    );
    expect(location.pathname).toBe('/manage_students');
  });

  it('defaults to manage students tab if incorrect tab provided in route and section has 0 students', () => {
    const location = {pathname: '/some_fake_path'};
    shallow(
      <TeacherDashboard
        {...DEFAULT_PROPS}
        location={location}
        studentCount={0}
      />
    );
    expect(location.pathname).toBe('/manage_students');
  });

  it('does not override given path if there are students and path is legitimate', () => {
    const location = {pathname: '/assessments'};
    shallow(<TeacherDashboard {...DEFAULT_PROPS} location={location} />);
    expect(location.pathname).toBe('/assessments');
  });
});
