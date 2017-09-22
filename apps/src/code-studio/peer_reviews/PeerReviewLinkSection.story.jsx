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
            reviews={[
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
            escalatedReviewId={3}
            reviews={[
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
