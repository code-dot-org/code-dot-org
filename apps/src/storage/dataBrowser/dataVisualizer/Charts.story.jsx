import React from 'react';
import CrossTabChart from './CrossTabChart';
import _ from 'lodash';

export default storybook =>
  storybook.storiesOf('Charts', module).add('CrossTab', () => (
    <div style={{width: '100%', padding: 30}}>
      <CrossTabChart
        records={makeFakeRecords()}
        numericColumns={[]}
        selectedColumn1="Date"
        selectedColumn2="Wind Direction"
        chartTitle="Study of the wind"
      />
    </div>
  ));

const DATES = [
  '3/4 Wed',
  '3/5 Thu',
  '3/6 Fri',
  '3/7 Sat',
  '3/8 Sun',
  '3/9 Mon'
];

const DIRECTIONS = ['E', 'NE', 'N', 'Northwest', 'W', 'SW', 'S', 'SE'];

function makeFakeRecords() {
  const result = [];
  for (let i = 0; i < 1000; i++) {
    result.push({
      Date: _.sample(DATES),
      'Wind Direction': _.sample(DIRECTIONS)
    });
  }
  return result;
}
