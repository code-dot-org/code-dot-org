import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedUnitOverviewHeader} from '@cdo/apps/code-studio/components/progress/UnitOverviewHeader';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {courseOfferings} from '@cdo/apps/templates/teacherDashboard/teacherDashboardTestHelpers';

import {
  fakeStudentAnnouncement,
  fakeTeacherAndStudentAnnouncement,
  fakeTeacherAnnouncement,
} from './FakeAnnouncementsTestData';

const defaultProps = {
  plcHeaderProps: undefined,
  announcements: [],
  isSignedIn: true,
  viewAs: ViewType.Instructor,
  isVerifiedInstructor: true,
  hasVerifiedResources: false,
  scriptId: 99,
  scriptName: 'course1',
  unitTitle: 'Course One',
  unitDescription:
    '# TEACHER Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*',
  unitStudentDescription:
    '# STUDENT Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*',
  versions: courseOfferings['1'].course_versions,
  courseVersionId: 1,
  resetViewAsUserId: jest.fn(),
  changeViewType: jest.fn(),
};

describe('UnitOverviewHeader', () => {
  it('renders', () => {
    shallow(<UnconnectedUnitOverviewHeader {...defaultProps} />, {
      disableLifecycleMethods: true,
    });
  });

  it('includes a PlcHeader if it has plcHeaderProps', () => {
    const wrapper = shallow(
      <UnconnectedUnitOverviewHeader
        {...defaultProps}
        plcHeaderProps={{
          unitName: 'foo',
          courseViewPath: '/s/my-course',
        }}
      />,
      {disableLifecycleMethods: true}
    );
    expect(wrapper.find('PlcHeader').length).toEqual(1);
  });

  it('does not have a PlcHeader if we have no plcHeaderProps', () => {
    const wrapper = shallow(
      <UnconnectedUnitOverviewHeader {...defaultProps} />,
      {
        disableLifecycleMethods: true,
      }
    );
    expect(wrapper.find('PlcHeader').length).toEqual(0);
  });

  it('has no notifications by default', () => {
    const wrapper = shallow(
      <UnconnectedUnitOverviewHeader {...defaultProps} />,
      {
        disableLifecycleMethods: true,
      }
    );
    expect(wrapper.find('Announcements').props().announcements.length).toEqual(
      0
    );
  });

  it('includes a single notification default for non-verified instructors', () => {
    const wrapper = shallow(
      <UnconnectedUnitOverviewHeader
        {...defaultProps}
        hasVerifiedResources={true}
        isVerifiedInstructor={false}
        verificationCheckComplete={true}
      />,
      {disableLifecycleMethods: true}
    );
    expect(wrapper.find('VerifiedResourcesNotification').length).toEqual(1);
  });

  it('has non-verified and provided instructor announcements if necessary', () => {
    const wrapper = shallow(
      <UnconnectedUnitOverviewHeader
        {...defaultProps}
        hasVerifiedResources={true}
        isVerifiedInstructor={false}
        verificationCheckComplete={true}
        announcements={[
          fakeTeacherAnnouncement,
          fakeTeacherAndStudentAnnouncement,
        ]}
      />,
      {disableLifecycleMethods: true}
    );
    expect(wrapper.find('Announcements').props().announcements.length).toEqual(
      2
    );
    expect(wrapper.find('VerifiedResourcesNotification').length).toEqual(1);
  });

  it('has participant announcement if viewing as participant', () => {
    const wrapper = shallow(
      <UnconnectedUnitOverviewHeader
        {...defaultProps}
        hasVerifiedResources={true}
        isVerifiedInstructor={false}
        viewAs={ViewType.Participant}
        announcements={[fakeStudentAnnouncement]}
      />,
      {disableLifecycleMethods: true}
    );
    expect(wrapper.find('Announcements').props().announcements.length).toEqual(
      1
    );
  });

  it('has correct unit description for instructor', () => {
    const wrapper = shallow(
      <UnconnectedUnitOverviewHeader {...defaultProps} />,
      {
        disableLifecycleMethods: true,
      }
    );
    expect(wrapper.find('SafeMarkdown').prop('markdown')).toBe(
      '# TEACHER Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
    );
  });

  it('has correct unit description for participant', () => {
    const wrapper = shallow(
      <UnconnectedUnitOverviewHeader
        {...defaultProps}
        viewAs={ViewType.Participant}
      />,
      {
        disableLifecycleMethods: true,
      }
    );
    expect(wrapper.find('SafeMarkdown').prop('markdown')).toBe(
      '# STUDENT Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
    );
  });
});
