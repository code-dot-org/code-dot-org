import React from 'react';
import CrossTabChart from './CrossTabChart';

export default storybook =>
  storybook
    .storiesOf('Charts', module)
    .add('CrossTab', () => (
      <CrossTabChart
        records={[
          {Date: '3/6 Fri', 'Wind Direction': 'E'},
          {Date: '3/7 Sat', 'Wind Direction': 'NE'},
          {Date: '3/8 Sun', 'Wind Direction': 'N'},
          {Date: '3/9 Mon', 'Wind Direction': 'NW'},
          {Date: '3/10 Tue', 'Wind Direction': 'W'},
          {Date: '3/11 Wed', 'Wind Direction': 'SW'},
          {Date: '3/11 Wed', 'Wind Direction': 'S'},
          {Date: '3/11 Wed', 'Wind Direction': 'SE'}
        ]}
        numericColumns={[]}
        selectedColumn1="Date"
        selectedColumn2="Wind Direction"
      />
    ));
