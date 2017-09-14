import React from 'react';
import PeerReviewSubmissions from './PeerReviewSubmissions';
import reactBootstrapStoryDecorator from '../pd/reactBootstrapStoryDecorator';

export default storybook => {
  storybook
    .storiesOf('Peer Review Submissions', module)
    .addDecorator(reactBootstrapStoryDecorator)
    .addStoryTable([
      {
        name: 'Peer Review Submissions',
        story: () => (
          <PeerReviewSubmissions
            submissions={[
              {
                submitter: 'Jon Snow',
                course_name: 'Intro to knowing things',
                unit_name: 'So you know nothing',
                level_name: 'Documenting all that you know',
                submission_date: '2/19/2017',
                escalation_date: '4/3/2/2017',
                id: 2
              },
              {
                submitter: 'Daenerys Targaryen',
                course_name: 'How to train your dragon',
                unit_name: 'Destruction 101',
                level_name: 'Intro to Dracarys',
                submission_date: '2/19/2017',
                escalation_date: '4/3/2/2017',
                id: 2
              }
            ]}
          />
        )
      }
    ]);
};
