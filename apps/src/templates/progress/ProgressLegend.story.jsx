import React from 'react';

import ProgressLegend from './ProgressLegend';

export default {
  component: ProgressLegend,
};

const Template = args => (
  <div style={{width: 970}}>
    <ProgressLegend {...args} />
  </div>
);

export const CSF = Template.bind({});
CSF.args = {
  includeCsfColumn: true,
};

export const CSP = Template.bind({});
CSP.args = {
  includeCsfColumn: false,
};

export const FullLegend = Template.bind({});
FullLegend.args = {
  includeCsfColumn: true,
  includeProgressNotApplicable: true,
  includeReviewStates: true,
};
