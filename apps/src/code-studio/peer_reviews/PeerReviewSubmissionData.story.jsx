import React from 'react';
import PeerReviewSubmissionData from './PeerReviewSubmissionData';
import reactBootstrapStoryDecorator from '../pd/reactBootstrapStoryDecorator';

export default storybook => {
  storybook
    .storiesOf('Peer Review Submissions', module)
    .addDecorator(reactBootstrapStoryDecorator)
    .addStoryTable([
      {
        name: 'Escalated Peer Review Submissions',
        story: () => (
          <PeerReviewSubmissionData
            filterType="escalated"
            submissions={[
              {
                submitter: 'Jon Snow',
                course_name: 'Intro to knowing things',
                unit_name: 'So you know nothing',
                level_name: 'Documenting all that you know',
                submission_date: '2/19/2017',
                escalation_date: '4/3/2/2017',
                review_ids: [[1, 'escalated'], [2, 'accepted']],
                status: 'escalated',
                accepted_reviews: 1,
                rejected_reviews: 0,
                escalated_review_id: 1
              },
              {
                submitter: 'Daenerys Targaryen',
                course_name: 'How to train your dragon',
                unit_name: 'Destruction 101',
                level_name: 'Intro to Dracarys',
                submission_date: '2/19/2017',
                escalation_date: '4/3/2/2017',
                review_ids: [[3, 'accepted'], [4, 'rejected'], [5, 'escalated']],
                status: 'escalated',
                accepted_reviews: 1,
                rejected_reviews: 0,
                escalated_review_id: 5
              }
            ]}
          />
        )
      },
      {
        name: 'Open Peer Review Submissions',
        story: () => (
          <PeerReviewSubmissionData
            filterType="open"
            submissions={[
              {
                submitter: 'Jon Snow',
                course_name: 'Intro to knowing things',
                unit_name: 'So you know nothing',
                level_name: 'Documenting all that you know',
                submission_date: '2/19/2017',
                escalation_date: undefined,
                review_ids: [[1, ''], [2, 'accepted']],
                status: 'escalated',
                accepted_reviews: 1,
                rejected_reviews: 0
              },
              {
                submitter: 'Daenerys Targaryen',
                course_name: 'How to train your dragon',
                unit_name: 'Destruction 101',
                level_name: 'Intro to Dracarys',
                submission_date: '2/19/2017',
                escalation_date: undefined,
                review_ids: [[3, 'accepted'], [4, '']],
                status: 'escalated',
                accepted_reviews: 1,
                rejected_reviews: 0
              }
            ]}
          />
        )
      }
    ]);
};
