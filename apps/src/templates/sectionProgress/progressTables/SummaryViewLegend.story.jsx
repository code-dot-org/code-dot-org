import React from 'react';
import SummaryViewLegend from './SummaryViewLegend';

export default {
  title: 'SummaryViewLegend',
  component: SummaryViewLegend,
};

const Template = args => <SummaryViewLegend {...args} />;

export const IncludesLightGreenProgressBox = Template.bind({});
IncludesLightGreenProgressBox.args = {
  showCSFProgressBox: true,
};

export const ExcludesLightGreenProgressBox = Template.bind({});
ExcludesLightGreenProgressBox.args = {
  showCSFProgressBox: false,
};
