import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import Announcements from '@cdo/apps/code-studio/components/progress/Announcements';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import Notification from '@cdo/apps/sharedComponents/Notification';

import {
  fakeStudentAnnouncement,
  fakeTeacherAndStudentAnnouncement,
  fakeTeacherAnnouncement,
  fakeTeacherAnnouncementWithDismissibleAndButtonText,
  fakeOldTeacherAnnouncement,
} from './FakeAnnouncementsTestData';

const defaultProps = {
  announcements: [],
  viewAs: ViewType.Instructor,
  width: 1000,
};

const firehoseAnalyticsData = {
  user_id: 1,
  script_id: 2,
};

describe('Announcements', () => {
  it('does not show Notifications if no announcements', () => {
    const wrapper = shallow(<Announcements {...defaultProps} />);
    expect(wrapper.find(Notification).length).toEqual(0);
  });

  it('displays old teacher announcement for instructor', () => {
    const wrapper = shallow(
      <Announcements
        {...defaultProps}
        announcements={[fakeOldTeacherAnnouncement]}
      />
    );
    expect(wrapper.find(Notification).length).toEqual(1);
  });

  it('does not display old teacher announcement for participant', () => {
    const wrapper = shallow(
      <Announcements
        {...defaultProps}
        announcements={[fakeOldTeacherAnnouncement]}
        viewAs={ViewType.Participant}
      />
    );
    expect(wrapper.find(Notification).length).toEqual(0);
  });

  it('displays new teacher announcement for instructor', () => {
    const wrapper = shallow(
      <Announcements
        {...defaultProps}
        announcements={[fakeTeacherAnnouncement]}
      />
    );
    expect(wrapper.find(Notification).length).toEqual(1);
  });

  it('defaults to dismissible and no button text for teacher announcement without dismissible and button text', () => {
    const wrapper = shallow(
      <Announcements
        {...defaultProps}
        announcements={[fakeTeacherAnnouncement]}
      />
    );
    expect(wrapper.find(Notification).length).toEqual(1);
    expect(wrapper.find(Notification).props().dismissible).toEqual(true);
    expect(wrapper.find(Notification).props().buttonText).toEqual('Learn more');
  });

  it('displays new teacher announcement with dismissible and button text for instructor', () => {
    const wrapper = shallow(
      <Announcements
        {...defaultProps}
        announcements={[fakeTeacherAnnouncementWithDismissibleAndButtonText]}
      />
    );
    expect(wrapper.find(Notification).length).toEqual(1);
    expect(wrapper.find(Notification).props().dismissible).toEqual(false);
    expect(wrapper.find(Notification).props().buttonText).toEqual(
      'Push the button'
    );
  });

  it('has only instructor announcements', () => {
    const wrapper = shallow(
      <Announcements
        {...defaultProps}
        announcements={[
          fakeStudentAnnouncement,
          fakeTeacherAndStudentAnnouncement,
          fakeTeacherAnnouncement,
        ]}
      />
    );
    expect(wrapper.find(Notification).length).toEqual(2);
  });

  it('has participant announcement if necessary', () => {
    const wrapper = shallow(
      <Announcements
        {...defaultProps}
        viewAs={ViewType.Participant}
        announcements={[fakeStudentAnnouncement]}
      />
    );
    expect(wrapper.find(Notification).length).toEqual(1);
  });

  it('has all participant announcements but no instructor announcements if necessary', () => {
    const wrapper = shallow(
      <Announcements
        {...defaultProps}
        viewAs={ViewType.Participant}
        announcements={[
          fakeStudentAnnouncement,
          fakeTeacherAndStudentAnnouncement,
          fakeTeacherAnnouncement,
        ]}
      />,
      {disableLifecycleMethods: true}
    );
    expect(wrapper.find(Notification).length).toEqual(2);
  });

  it('displays instructor announcement with analytics data', () => {
    const wrapper = shallow(
      <Announcements
        {...defaultProps}
        firehoseAnalyticsData={firehoseAnalyticsData}
        announcements={[fakeTeacherAnnouncement]}
      />
    );
    expect(wrapper.find(Notification).length).toEqual(1);
  });
});
