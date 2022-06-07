import React from 'react';
import ParticipantFeedbackNotification from './ParticipantFeedbackNotification';
import sinon from 'sinon';

export default storybook => {
  return storybook
    .storiesOf('ParticipantFeedbackNotification', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'ParticipantFeedbackNotification',
        story: () => {
          withFakeServer();
          return <ParticipantFeedbackNotification studentId={123} />;
        }
      }
    ]);
};

function withFakeServer() {
  const server = sinon.fakeServer.create({
    autoRespond: true
  });
  const successResponse = body => [
    200,
    {'Content-Type': 'application/json'},
    JSON.stringify(body)
  ];
  server.respondWith(
    'GET',
    '/api/v1/teacher_feedbacks/count?student_id=123',
    successResponse('2')
  );
}
