import React from 'react';
import PeerReviewLinkSection from './PeerReviewLinkSection';

export default {
  component: PeerReviewLinkSection,
};

const Template = args => (
  <div id="application-container">
    <PeerReviewLinkSection {...args} />
  </div>
);

export const variousSubmissions = Template.bind({});
variousSubmissions.args = {
  reviews: [
    [1, 'accepted'],
    [2, 'rejected'],
    [3, 'escalated'],
    [4, ''],
  ],
};
