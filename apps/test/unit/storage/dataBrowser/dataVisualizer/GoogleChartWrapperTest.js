import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import GoogleChart from '@cdo/apps/applab/GoogleChart';
import {ChartType} from '@cdo/apps/storage/dataBrowser/dataUtils';
import GoogleChartWrapper from '@cdo/apps/storage/dataBrowser/dataVisualizer/GoogleChartWrapper';

describe('GoogleChartWrapper', () => {
  describe('updateChart', () => {
    let spy;
    beforeEach(() => {
      GoogleChart.lib = {};
      spy = jest
        .spyOn(GoogleChart.prototype, 'drawChart')
        .mockClear()
        .mockImplementation();
    });
    afterEach(() => {
      spy.mockRestore();
    });

    it('can show a bar chart', () => {
      mount(
        <GoogleChartWrapper
          records={[
            {category1: 'red', category2: 1, category3: 10},
            {category1: 'blue', category2: 1, category3: 20},
            {category1: 'red', category2: 3, category3: 10},
            {category1: 'green', category2: 4, category3: 10},
          ]}
          numericColumns={['category2', 'category3']}
          chartType={ChartType.BAR_CHART}
          selectedColumn1="category1"
          chartTitle="Title"
        />
      );

      const expectedChartData = [
        {category1: 'blue', count: 1},
        {category1: 'green', count: 1},
        {category1: 'red', count: 2},
      ];
      const expectedChartOptions = {
        title: 'Title',
        legend: {position: 'none'},
        hAxis: {
          title: 'category1',
          format: '#.#',
        },
        vAxis: {
          title: 'Count',
          format: '#.#',
        },
      };

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0]).toEqual([
        expectedChartData,
        ['category1', 'count'],
        expectedChartOptions,
      ]);
    });

    it('can show a histogram', () => {
      const expectedChartData = [
        {category1: 'red', category2: 1, category3: 10},
        {category1: 'blue', category2: 1, category3: 20},
        {category1: 'red', category2: 3, category3: 10},
        {category1: 'green', category2: 4, category3: 10},
      ];
      const expectedChartOptions = {
        title: 'Title',
        legend: {position: 'none'},
        hAxis: {
          title: 'category2',
          format: '#.#',
          titleTextStyle: {italic: false},
        },
        vAxis: {
          title: 'Count',
          format: '#.#',
          titleTextStyle: {italic: false},
        },
      };

      mount(
        <GoogleChartWrapper
          records={expectedChartData}
          numericColumns={['category2', 'category3']}
          chartType={ChartType.HISTOGRAM}
          selectedColumn1="category2"
          bucketSize="2"
          chartTitle="Title"
        />
      );

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0]).toEqual([
        expectedChartData,
        ['category2'],
        {...expectedChartOptions, histogram: {bucketSize: '2'}},
      ]);
    });

    it('can show a scatter plot', () => {
      const expectedChartData = [
        {category1: 'red', category2: 1, category3: 10},
        {category1: 'blue', category2: 1, category3: 20},
        {category1: 'red', category2: 3, category3: 10},
        {category1: 'green', category2: 4, category3: 10},
      ];
      const expectedChartOptions = {
        title: 'Title',
        legend: {position: 'none'},
        hAxis: {
          title: 'category2',
          format: '#.#',
        },
        vAxis: {
          title: 'category3',
          format: '#.#',
        },
      };

      mount(
        <GoogleChartWrapper
          records={expectedChartData}
          numericColumns={['category2', 'category3']}
          chartType={ChartType.SCATTER_PLOT}
          selectedColumn1="category2"
          selectedColumn2="category3"
          chartTitle="Title"
        />
      );
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0]).toEqual([
        expectedChartData,
        ['category2', 'category3'],
        expectedChartOptions,
      ]);
    });
  });
});
