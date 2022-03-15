import React from 'react';
import {assert, expect} from '../../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {UnconnectedUnitOverviewHeader as UnitOverviewHeader} from '@cdo/apps/code-studio/components/progress/UnitOverviewHeader';
import {
  fakeStudentAnnouncement,
  fakeTeacherAndStudentAnnouncement,
  fakeTeacherAnnouncement
} from './FakeAnnouncementsTestData';
import {courseOfferings} from '@cdo/apps/templates/teacherDashboard/teacherDashboardTestHelpers';

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
  courseVersionId: 1
};

describe('UnitOverviewHeader', () => {
  it('renders', () => {
    shallow(<UnitOverviewHeader {...defaultProps} />, {
      disableLifecycleMethods: true
    });
  });

  it('includes a PlcHeader if it has plcHeaderProps', () => {
    const wrapper = shallow(
      <UnitOverviewHeader
        {...defaultProps}
        plcHeaderProps={{
          unitName: 'foo',
          courseViewPath: '/s/my-course'
        }}
      />,
      {disableLifecycleMethods: true}
    );
    assert.equal(wrapper.find('PlcHeader').length, 1);
  });

  it('does not have a PlcHeader if we have no plcHeaderProps', () => {
    const wrapper = shallow(<UnitOverviewHeader {...defaultProps} />, {
      disableLifecycleMethods: true
    });
    assert.equal(wrapper.find('PlcHeader').length, 0);
  });

  it('has no notifications by default', () => {
    const wrapper = shallow(<UnitOverviewHeader {...defaultProps} />, {
      disableLifecycleMethods: true
    });
    assert.equal(wrapper.find('Announcements').props().announcements.length, 0);
  });

  it('includes a single notification default for non-verified instructors', () => {
    const wrapper = shallow(
      <UnitOverviewHeader
        {...defaultProps}
        hasVerifiedResources={true}
        isVerifiedInstructor={false}
        verificationCheckComplete={true}
      />,
      {disableLifecycleMethods: true}
    );
    assert.equal(wrapper.find('VerifiedResourcesNotification').length, 1);
  });

  it('has non-verified and provided instructor announcements if necessary', () => {
    const wrapper = shallow(
      <UnitOverviewHeader
        {...defaultProps}
        hasVerifiedResources={true}
        isVerifiedInstructor={false}
        verificationCheckComplete={true}
        announcements={[
          fakeTeacherAnnouncement,
          fakeTeacherAndStudentAnnouncement
        ]}
      />,
      {disableLifecycleMethods: true}
    );
    assert.equal(wrapper.find('Announcements').props().announcements.length, 2);
    assert.equal(wrapper.find('VerifiedResourcesNotification').length, 1);
  });

  it('has participant announcement if viewing as participant', () => {
    const wrapper = shallow(
      <UnitOverviewHeader
        {...defaultProps}
        hasVerifiedResources={true}
        isVerifiedInstructor={false}
        viewAs={ViewType.Participant}
        announcements={[fakeStudentAnnouncement]}
      />,
      {disableLifecycleMethods: true}
    );
    assert.equal(wrapper.find('Announcements').props().announcements.length, 1);
  });

  it('passes properly-formatted versions to AssignmentVersionSelector', () => {
    const versions = {
      1: {
        id: 1,
        version_year: '2017',
        content_root_id: 10,
        name: 'Course A',
        path: '/s/coursea-2017',
        type: 'Script',
        is_stable: true,
        is_recommended: false,
        locales: ['العربية', 'Čeština', 'Deutsch', 'English'],
        units: {
          1: {
            id: 1,
            name: 'Course A',
            path: '/s/coursea-2017',
            lesson_extras_available: true
          }
        }
      },
      2: {
        id: 2,
        version_year: '2018',
        content_root_id: 11,
        name: 'Course A',
        path: '/s/coursea-2018',
        type: 'Script',
        is_stable: true,
        is_recommended: true,
        locales: ['English', 'Italiano', 'Slovenčina'],
        units: {
          2: {
            id: 2,
            name: 'Course A (2018)',
            path: '/s/coursea-2018',
            lesson_extras_available: true
          }
        }
      }
    };
    const wrapper = shallow(
      <UnitOverviewHeader
        {...defaultProps}
        courseVersionId={2}
        versions={versions}
      />,
      {disableLifecycleMethods: true}
    );

    const versionSelector = wrapper.find('AssignmentVersionSelector');
    assert.equal(1, versionSelector.length);
    const renderedVersions = versionSelector.props().courseVersions;
    assert.equal(2, Object.values(renderedVersions).length);
  });

  it('has correct unit description for instructor', () => {
    const wrapper = shallow(<UnitOverviewHeader {...defaultProps} />, {
      disableLifecycleMethods: true
    });
    expect(wrapper.find('SafeMarkdown').prop('markdown')).to.equal(
      '# TEACHER Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
    );
  });

  it('has correct unit description for participant', () => {
    const wrapper = shallow(
      <UnitOverviewHeader {...defaultProps} viewAs={ViewType.Participant} />,
      {
        disableLifecycleMethods: true
      }
    );
    expect(wrapper.find('SafeMarkdown').prop('markdown')).to.equal(
      '# STUDENT Title \n This is the unit description with [link](https://studio.code.org/home) **Bold** *italics*'
    );
  });
});
