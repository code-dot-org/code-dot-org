import React from 'react';
import {Provider} from 'react-redux';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {reduxStore} from '@cdo/storybook/decorators';

import ParticipantFeedbackNotification from './ParticipantFeedbackNotification';

export default {
  component: ParticipantFeedbackNotification,
};

const Template = args => {
  withFakeServer();
  return (
    <Provider store={reduxStore()}>
      <ParticipantFeedbackNotification {...args} />
    </Provider>
  );
};

export const ExampleStudent = Template.bind({});
ExampleStudent.args = {
  studentId: 123,
};

function withFakeServer() {
  const server = sinon.fakeServer.create({
    autoRespond: true,
  });
  const successResponse = body => [
    200,
    {'Content-Type': 'application/json'},
    JSON.stringify(body),
  ];
  server.respondWith(
    'GET',
    '/api/v1/teacher_feedbacks/count?student_id=123',
    successResponse('2')
  );
}
