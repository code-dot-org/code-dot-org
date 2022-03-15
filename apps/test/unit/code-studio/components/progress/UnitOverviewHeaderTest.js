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
  versions: [],
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
    const versions = [
      {
        name: 'coursea-2017',
        year: '2017',
        title: '2017',
        isStable: true,
        locales: ['English', 'Italian'],
        localeCodes: ['en-US', 'it-IT'],
        canViewVersion: true
      },
      {
        name: 'coursea-2018',
        year: '2018',
        title: '2018',
        isStable: true,
        locales: ['English'],
        localeCodes: ['en-US'],
        canViewVersion: true
      },
      {
        name: 'coursea-2019',
        year: '2019',
        title: '2019',
        isStable: false,
        locales: [],
        localeCodes: [],
        canViewVersion: false
      }
    ];
    const wrapper = shallow(
      <UnitOverviewHeader
        {...defaultProps}
        scriptName="coursea-2018"
        versions={versions}
        localeCode="it-IT"
      />,
      {disableLifecycleMethods: true}
    );

    const versionSelector = wrapper.find('AssignmentVersionSelector');
    assert.equal(1, versionSelector.length);
    const renderedVersions = versionSelector.props().versions;
    assert.equal(2, renderedVersions.length);
    const coursea2017 = renderedVersions.find(v => v.name === 'coursea-2017');
    assert.equal(true, coursea2017.isRecommended);
    const coursea2018 = renderedVersions.find(v => v.name === 'coursea-2018');
    assert.equal(true, coursea2018.isSelected);
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
