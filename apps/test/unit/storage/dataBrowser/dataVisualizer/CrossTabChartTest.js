import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import CrossTabChart, {
  createPivotTable,
  getColorForValue
} from '@cdo/apps/storage/dataBrowser/dataVisualizer/CrossTabChart';

const DEFAULT_PROPS = {
  records: [],
  numericColumns: [],
  selectedColumn1: '',
  selectedColumn2: ''
};

describe('CrossTabChart', () => {
  it('renders', () => {
    mount(<CrossTabChart {...DEFAULT_PROPS} />);
  });

  describe('getColorForValue', () => {
    it('maps the min value to white', () => {
      expect(getColorForValue(19, 19, 100)).to.equal('hsl(217, 89%, 100%)');

      expect(getColorForValue(4, 4, 25)).to.equal('hsl(217, 89%, 100%)');

      expect(getColorForValue(0, 0, 3)).to.equal('hsl(217, 89%, 100%)');
    });

    it('maps intermediate values proportionately', () => {
      expect(getColorForValue(50, 0, 100)).to.equal('hsl(217, 89%, 78%)');

      expect(getColorForValue(2, 0, 3)).to.equal(
        'hsl(217, 89%, 70.66666666666667%)'
      );

      expect(getColorForValue(20, 10, 50)).to.equal('hsl(217, 89%, 89%)');
    });

    it('maps the max value to hsl(217, 89%, 56%)', () => {
      expect(getColorForValue(100, 19, 100)).to.equal('hsl(217, 89%, 56%)');

      expect(getColorForValue(25, 4, 25)).to.equal('hsl(217, 89%, 56%)');

      expect(getColorForValue(3, 0, 3)).to.equal('hsl(217, 89%, 56%)');
    });
  });

  describe('createPivotTable', () => {
    it('populates zeroes for all row/column combinations', () => {
      const records = [
        {abc: 'a', value: 1},
        {abc: 'b', value: 2},
        {abc: 'c', value: 3}
      ];
      const expectedPivotData = {
        chartData: [
          {abc: 'a', 1: 1, 2: 0, 3: 0},
          {abc: 'b', 1: 0, 2: 1, 3: 0},
          {abc: 'c', 1: 0, 2: 0, 3: 1}
        ],
        columns: ['abc', 1, 2, 3]
      };
      expect(createPivotTable(records, [], 'abc', 'value')).to.deep.equal(
        expectedPivotData
      );
    });

    it('sorts string columns alphabetically, but with the row column first', () => {
      const records = [
        {abc: 'a', value: 'z'},
        {abc: 'b', value: 'z'},
        {abc: 'a', value: 'z'},
        {abc: 'c', value: 'z'},
        {abc: 'c', value: 'a'}
      ];
      const expectedPivotData = {
        chartData: [
          {abc: 'a', a: 0, z: 2},
          {abc: 'b', a: 0, z: 1},
          {abc: 'c', a: 1, z: 1}
        ],
        columns: ['abc', 'a', 'z']
      };
      expect(createPivotTable(records, [], 'abc', 'value')).to.deep.equal(
        expectedPivotData
      );
    });

    it('sorts numeric columns numerically, with the row column first', () => {
      const records = [
        {abc: 'a', value: 134},
        {abc: 'b', value: 134},
        {abc: 'a', value: 134},
        {abc: 'c', value: 134},
        {abc: 'c', value: 18}
      ];
      const expectedPivotData = {
        chartData: [
          {abc: 'a', 18: 0, 134: 2},
          {abc: 'b', 18: 0, 134: 1},
          {abc: 'c', 18: 1, 134: 1}
        ],
        columns: ['abc', 18, 134]
      };
      expect(
        createPivotTable(records, ['value'], 'abc', 'value')
      ).to.deep.equal(expectedPivotData);
    });

    it('sorts rows', () => {
      const records = [
        {abc: 'd', value: 'x'},
        {abc: 'b', value: 'x'},
        {abc: 'a', value: 'x'},
        {abc: 'c', value: 'x'},
        {abc: 'c', value: 'y'}
      ];
      const expectedPivotData = {
        chartData: [
          {abc: 'a', x: 1, y: 0},
          {abc: 'b', x: 1, y: 0},
          {abc: 'c', x: 1, y: 1},
          {abc: 'd', x: 1, y: 0}
        ],
        columns: ['abc', 'x', 'y']
      };
      expect(createPivotTable(records, [], 'abc', 'value')).to.deep.equal(
        expectedPivotData
      );
    });
  });
});
