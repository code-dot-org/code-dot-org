import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import {UnconnectedTeacherDashboard as TeacherDashboard} from '@cdo/apps/templates/teacherDashboard/TeacherDashboard';

const DEFAULT_PROPS = {
  studioUrlPrefix: 'https://studio.code.org',
  pegasusUrlPrefix: 'https://code.org',
  sectionId: 1,
  sectionName: 'My Section',
  location: {},
  studentCount: 0
};

describe('TeacherDashboard', () => {
  it('renders TeacherDashboardHeader', () => {
    const wrapper = shallow(<TeacherDashboard {...DEFAULT_PROPS} />);
    expect(wrapper.find('TeacherDashboardHeader')).to.exist;
  });

  it('does not render TeacherDashboardHeader on /login_info', () => {
    const location = {pathname: '/login_info'};
    const wrapper = shallow(
      <TeacherDashboard {...DEFAULT_PROPS} location={location} />
    );
    expect(wrapper.find('TeacherDashboardHeader')).to.not.exist;
  });
});
