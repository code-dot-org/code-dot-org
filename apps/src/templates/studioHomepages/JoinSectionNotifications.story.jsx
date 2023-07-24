import React from 'react';
import JoinSectionNotifications from './JoinSectionNotifications';
import {Provider} from 'react-redux';
import {reduxStore} from '@cdo/storybook/decorators';

export default {
  title: 'JoinSectionNotifications',
  component: JoinSectionNotifications,
};

//
// TEMPLATE
//

const Template = args => (
  <Provider store={reduxStore()}>
    <JoinSectionNotifications {...args} />
  </Provider>
);

//
// STORIES
//

export const JoinSucceeded = Template.bind({});
JoinSucceeded.args = {
  action: 'join',
  result: 'success',
  name: 'Ada Lovelace Homeroom',
};

export const LeaveSucceeded = Template.bind({});
LeaveSucceeded.args = {
  action: 'leave',
  result: 'success',
  name: 'Ada Lovelace Homeroom',
  id: 'BCDFGH',
};

export const SectionNotFound = Template.bind({});
SectionNotFound.args = {
  action: 'join',
  result: 'section_notfound',
  id: 'BCDFGH',
};

export const JoinFailed = Template.bind({});
JoinFailed.args = {
  action: 'join',
  result: 'fail',
  id: 'BCDFGH',
};

export const AlreadyAMember = Template.bind({});
AlreadyAMember.args = {
  action: 'join',
  result: 'exists',
  name: 'Ada Lovelace Homeroom',
};

export const NoNotification = Template.bind({});
NoNotification.args = {
  action: null,
  result: null,
  id: 'Ada Lovelace Homeroom',
};
