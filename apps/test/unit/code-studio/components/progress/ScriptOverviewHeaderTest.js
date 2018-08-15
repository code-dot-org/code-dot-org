import React from 'react';
import { assert } from '../../../../util/configuredChai';
import { shallow } from 'enzyme';
import { ViewType } from '@cdo/apps/code-studio/viewAsRedux';
import { NotificationType } from '@cdo/apps/templates/Notification';
import { UnconnectedScriptOverviewHeader as ScriptOverviewHeader } from
  '@cdo/apps/code-studio/components/progress/ScriptOverviewHeader';

const defaultProps = {
  plcHeaderProps: undefined,
  announcements: [],
  isSignedIn: true,
  viewAs: ViewType.Teacher,
  isVerifiedTeacher: true,
  hasVerifiedResources: false,
  scriptId: 99,
  scriptName: 'course1',
  scriptTitle: 'Course One',
  scriptDescription: 'The first course',
  versions: [],
};

const fakeAnnouncement = {
  notice: 'Notice',
  details: 'More detail here',
  link: '/foo/bar',
  type: NotificationType.information
};

describe('ScriptOverviewHeader', () => {
  it('renders', () => {
    shallow(
      <ScriptOverviewHeader
        {...defaultProps}
      />
    );
  });

  it('includes a PlcHeader if it has plcHeaderProps', () => {
    const wrapper = shallow(
      <ScriptOverviewHeader
        {...defaultProps}
        plcHeaderProps={{
          unitName: 'foo',
          courseViewPath: '/s/my-course'
        }}
      />
    );
    assert.equal(wrapper.find('PlcHeader').length, 1);
  });

  it('does not have a PlcHeader if we have no plcHeaderProps', () => {
    const wrapper = shallow(
      <ScriptOverviewHeader
        {...defaultProps}
      />
    );
    assert.equal(wrapper.find('PlcHeader').length, 0);
  });

  it('has no notifications by default', () => {
    const wrapper = shallow(
      <ScriptOverviewHeader
        {...defaultProps}
      />
    );
    assert.equal(wrapper.find('Notification').length, 0);
  });

  it('includes a single notification default for non-verfied teachers', () => {
    const wrapper = shallow(
      <ScriptOverviewHeader
        {...defaultProps}
        hasVerifiedResources={true}
        isVerifiedTeacher={false}
      />
    );
    assert.equal(wrapper.find('ScriptAnnouncements').props().announcements.length, 1);
  });

  it('has non-verified and provided announcements if necessary', () => {
    const wrapper = shallow(
      <ScriptOverviewHeader
        {...defaultProps}
        hasVerifiedResources={true}
        isVerifiedTeacher={false}
        announcements={[fakeAnnouncement]}
      />
    );
    assert.equal(wrapper.find('ScriptAnnouncements').props().announcements.length, 2);
  });

  it('does not show announcements to students', () => {
    const wrapper = shallow(
      <ScriptOverviewHeader
        {...defaultProps}
        hasVerifiedResources={true}
        isVerifiedTeacher={false}
        viewAs={ViewType.Student}
        announcements={[fakeAnnouncement]}
      />
    );
    assert.equal(wrapper.find('ScriptAnnouncements').length, 0);
  });
});
