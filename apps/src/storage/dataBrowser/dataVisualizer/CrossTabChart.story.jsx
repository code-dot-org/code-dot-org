import _ from 'lodash';
import React from 'react';

import CrossTabChart from './CrossTabChart';

export default {
  component: CrossTabChart,
};

const Template = args => <CrossTabChart {...args} />;

export const BasicExample = Template.bind({});
BasicExample.args = {
  records: makeFakeRecords(),
  numericColumns: [],
  selectedColumn1: 'Date',
  selectedColumn2: 'Wind Direction',
  chartTitle: 'Study of the wind',
};

function makeFakeRecords() {
  const DATES = [
    '3/4 Wed',
    '3/5 Thu',
    '3/6 Fri',
    '3/7 Sat',
    '3/8 Sun',
    '3/9 Mon',
  ];
  const DIRECTIONS = ['E', 'NE', 'N', 'Northwest', 'W', 'SW', 'S', 'SE'];
  const result = [];
  for (let i = 0; i < 1000; i++) {
    result.push({
      Date: _.sample(DATES),
      'Wind Direction': _.sample(DIRECTIONS),
    });
  }
  return result;
}
