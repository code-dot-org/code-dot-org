import React from 'react';
import StudentFeedbackNotification from './StudentFeedbackNotification';
import sinon from 'sinon';

export default storybook => {
  return storybook
    .storiesOf('StudentFeedbackNotification', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'StudentFeedbackNotification',
        story: () => {
          withFakeServer();
          return <StudentFeedbackNotification studentId={123} />;
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
