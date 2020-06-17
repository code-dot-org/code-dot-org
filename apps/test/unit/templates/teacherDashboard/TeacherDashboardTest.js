import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/deprecatedChai';
import {UnconnectedTeacherDashboard as TeacherDashboard} from '@cdo/apps/templates/teacherDashboard/TeacherDashboard';

const DEFAULT_PROPS = {
  studioUrlPrefix: 'https://studio.code.org',
  pegasusUrlPrefix: 'https://code.org',
  sectionId: 1,
  sectionName: 'My Section',
  location: {},
  studentCount: 5
};

describe('TeacherDashboard', () => {
  it('renders TeacherDashboardHeader', () => {
    const wrapper = shallow(<TeacherDashboard {...DEFAULT_PROPS} />);
    expect(wrapper.find('Connect(TeacherDashboardHeader)')).to.exist;
  });

  it('does not render TeacherDashboardHeader on /login_info', () => {
    const location = {pathname: '/login_info'};
    const wrapper = shallow(
      <TeacherDashboard {...DEFAULT_PROPS} location={location} />
    );
    expect(wrapper.find('Connect(TeacherDashboardHeader)')).to.not.exist;
  });

  it('does not render TeacherDashboardHeader on /standards_report', () => {
    const location = {pathname: '/standards_report'};
    const wrapper = shallow(
      <TeacherDashboard {...DEFAULT_PROPS} location={location} />
    );
    expect(wrapper.find('Connect(TeacherDashboardHeader)')).to.not.exist;
  });

  it('defaults to progress tab if no tab provided in route', () => {
    const location = {pathname: '/'};
    const wrapper = shallow(
      <TeacherDashboard {...DEFAULT_PROPS} location={location} />
    );
    expect(wrapper.instance().props.location.pathname).to.equal('/progress');
  });

  it('defaults to progress tab if incorrect tab provided in route', () => {
    const location = {pathname: '/some_fake_path'};
    const wrapper = shallow(
      <TeacherDashboard {...DEFAULT_PROPS} location={location} />
    );
    expect(wrapper.instance().props.location.pathname).to.equal('/progress');
  });

  it('defaults to manage students tab if no tab provided in route and section has 0 students', () => {
    const location = {pathname: '/'};
    const wrapper = shallow(
      <TeacherDashboard
        {...DEFAULT_PROPS}
        location={location}
        studentCount={0}
      />
    );
    expect(wrapper.instance().props.location.pathname).to.equal(
      '/manage_students'
    );
  });

  it('defaults to manage students tab if incorrect tab provided in route and section has 0 students', () => {
    const location = {pathname: '/some_fake_path'};
    const wrapper = shallow(
      <TeacherDashboard
        {...DEFAULT_PROPS}
        location={location}
        studentCount={0}
      />
    );
    expect(wrapper.instance().props.location.pathname).to.equal(
      '/manage_students'
    );
  });
});
