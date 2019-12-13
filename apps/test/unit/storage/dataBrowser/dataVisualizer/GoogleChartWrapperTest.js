import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../../util/reconfiguredChai';
import GoogleChart from '@cdo/apps/applab/GoogleChart';
import GoogleChartWrapper from '@cdo/apps/storage/dataBrowser/dataVisualizer/GoogleChartWrapper';

describe('GoogleChartWrapper', () => {
  describe('updateChart', () => {
    let spy;
    beforeEach(() => {
      GoogleChart.lib = {};
      spy = sinon.stub(GoogleChart.prototype, 'drawChart');
    });
    afterEach(() => {
      spy.restore();
    });

    it('can show a bar chart', () => {
      mount(
        <GoogleChartWrapper
          records={[
            {category1: 'red', category2: 1, category3: 10},
            {category1: 'blue', category2: 1, category3: 20},
            {category1: 'red', category2: 3, category3: 10},
            {category1: 'green', category2: 4, category3: 10}
          ]}
          numericColumns={['category2', 'category3']}
          chartType="Bar Chart"
          selectedColumn1="category1"
          chartTitle="Title"
        />
      );

      const expectedChartData = [
        {category1: 'red', count: 2},
        {category1: 'blue', count: 1},
        {category1: 'green', count: 1}
      ];

      expect(spy).to.have.been.calledOnce;
      expect(spy.getCalls()[0].args).to.deep.equal([
        expectedChartData,
        ['category1', 'count'],
        {title: 'Title'}
      ]);
    });

    it('can show a histogram', () => {
      const expectedChartData = [
        {category1: 'red', category2: 1, category3: 10},
        {category1: 'blue', category2: 1, category3: 20},
        {category1: 'red', category2: 3, category3: 10},
        {category1: 'green', category2: 4, category3: 10}
      ];
      mount(
        <GoogleChartWrapper
          records={expectedChartData}
          numericColumns={['category2', 'category3']}
          chartType="Histogram"
          selectedColumn1="category2"
          bucketSize="2"
          chartTitle="Title"
        />
      );

      expect(spy).to.have.been.calledOnce;
      expect(spy.getCalls()[0].args).to.deep.equal([
        expectedChartData,
        ['category2'],
        {histogram: {bucketSize: '2'}, title: 'Title'}
      ]);
    });

    it('can show a scatter plot', () => {
      const expectedChartData = [
        {category1: 'red', category2: 1, category3: 10},
        {category1: 'blue', category2: 1, category3: 20},
        {category1: 'red', category2: 3, category3: 10},
        {category1: 'green', category2: 4, category3: 10}
      ];
      mount(
        <GoogleChartWrapper
          records={expectedChartData}
          numericColumns={['category2', 'category3']}
          chartType="Scatter Plot"
          selectedColumn1="category2"
          selectedColumn2="category3"
          chartTitle="Title"
        />
      );
      expect(spy).to.have.been.calledOnce;
      expect(spy.getCalls()[0].args).to.deep.equal([
        expectedChartData,
        ['category2', 'category3'],
        {title: 'Title'}
      ]);
    });
  });
});
