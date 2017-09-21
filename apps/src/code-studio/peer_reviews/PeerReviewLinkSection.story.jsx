import React from 'react';
import PeerReviewLinkSection from './PeerReviewLinkSection';
import reactBootstrapStoryDecorator from '../pd/reactBootstrapStoryDecorator';

export default storybook => {
  storybook
    .storiesOf('Peer Review Link Section', module)
    .addDecorator(reactBootstrapStoryDecorator)
    .addStoryTable([
      {
        name: 'Peer Review Links for non escalated submissions',
        story: () => (
          <PeerReviewLinkSection
            filterType="open"
            submissions={[
              [1, 'accepted'],
              [2, 'rejected'],
              [3, 'escalated'],
              [4, '']
            ]}
          />
        )
      },
      {
        name: 'Peer Review Links for escalated submissions',
        story: () => (
          <PeerReviewLinkSection
            filterType="escalated"
            escalatedSubmissionId={3}
            submissions={[
              [1, 'accepted'],
              [2, 'rejected'],
              [3, 'escalated'],
              [4, '']
            ]}
          />
        )
      }
    ]);
};
