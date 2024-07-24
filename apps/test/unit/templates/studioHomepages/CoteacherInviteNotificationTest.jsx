import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import Notification, {NotificationType} from '@cdo/apps/templates/Notification';
import {UnconnectedCoteacherInviteNotification as CoteacherInviteNotification} from '@cdo/apps/templates/studioHomepages/CoteacherInviteNotification';

describe('CoteacherInviteNotification', () => {
  const defaultProps = {
    isForPl: false,
    asyncLoadCoteacherInvite: () => {},
    asyncLoadSectionData: () => {},
    coteacherInvite: {
      id: 1,
      invited_by_name: 'The Great Pumpkin',
      invited_by_email: 'thegreatpumpkin@code.org',
      section_name: 'The Pumpkin Patch',
      status: 'invited',
      instructor_name: 'Linus',
      participant_type: 'student',
    },
    coteacherInviteForPl: {
      id: 2,
      invited_by_name: 'Ms. Frizzle',
      invited_by_email: 'magicSchoolBus@code.org',
      section_name: 'Section for teachers',
      status: 'invited',
      instructor_name: 'Larry',
      participant_type: 'teacher',
    },
  };

  it('renders no notification for classroom sections if there is no coteacher invite', () => {
    const wrapper = shallow(
      <CoteacherInviteNotification {...defaultProps} coteacherInvite={null} />
    );
    expect(wrapper.find(Notification).length).toBe(0);
  });

  it('renders no notification for PL sections if there is no coteacher invite', () => {
    const wrapper = shallow(
      <CoteacherInviteNotification
        {...defaultProps}
        isForPl={true}
        coteacherInviteForPl={null}
      />
    );
    expect(wrapper.find(Notification).length).toBe(0);
  });

  it('renders notification if there is a coteacher invite', () => {
    const wrapper = shallow(<CoteacherInviteNotification {...defaultProps} />);
    const notification = wrapper.find(Notification);
    expect(notification.length).toBe(1);
    expect(notification.props().dismissible).toBe(false);
    expect(notification.props().type).toBe(NotificationType.collaborate);
    expect(notification.props().notice).toContain('The Great Pumpkin');
  });

  it('renders PL notification if there is a coteacher invite for PL', () => {
    const wrapper = shallow(
      <CoteacherInviteNotification {...defaultProps} isForPl={true} />
    );
    const notification = wrapper.find(Notification);
    expect(notification.length).toBe(1);
    expect(notification.props().dismissible).toBe(false);
    expect(notification.props().type).toBe(NotificationType.collaborate);
    expect(notification.props().notice).toContain('Ms. Frizzle');
  });

  it('renders no notifications if there is no PL invite and isForPl is true', () => {
    const wrapper = shallow(
      <CoteacherInviteNotification
        {...defaultProps}
        isForPl={true}
        coteacherInvite={null}
        coteacherInviteForPl={null}
      />
    );
    expect(wrapper.find(Notification).length).toBe(0);
  });
});
