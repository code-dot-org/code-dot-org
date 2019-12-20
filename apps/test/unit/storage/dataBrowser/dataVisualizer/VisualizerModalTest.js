import React from 'react';
import {shallow, mount} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../../util/reconfiguredChai';
import msg from '@cdo/locale';
import {ChartType} from '@cdo/apps/storage/dataBrowser/dataUtils';
import GoogleChart from '@cdo/apps/applab/GoogleChart';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import {UnconnectedVisualizerModal as VisualizerModal} from '@cdo/apps/storage/dataBrowser/dataVisualizer/VisualizerModal';
import DataVisualizer from '@cdo/apps/storage/dataBrowser/dataVisualizer/DataVisualizer';

const DEFAULT_PROPS = {
  tableColumns: [],
  tableName: 'testTable',
  tableRecords: []
};

describe('VisualizerModal', () => {
  it('The modal starts closed', () => {
    let wrapper = shallow(<VisualizerModal {...DEFAULT_PROPS} />);
    expect(wrapper.find(BaseDialog).prop('isOpen')).to.be.false;
  });

  it('The modal opens when the button is clicked', () => {
    let wrapper = shallow(<VisualizerModal {...DEFAULT_PROPS} />);
    expect(wrapper.find(BaseDialog).prop('isOpen')).to.be.false;

    wrapper.instance().handleOpen();
    expect(wrapper.find(BaseDialog).prop('isOpen')).to.be.true;
  });

  describe('state management', () => {
    it('clears selected columns when chart type changes', () => {
      let wrapper = shallow(<VisualizerModal {...DEFAULT_PROPS} />);
      wrapper.instance().setState({
        chartType: ChartType.SCATTER_PLOT,
        selectedColumn1: 'column1',
        selectedColumn2: 'column2'
      });
      expect(wrapper.instance().state.selectedColumn1).to.equal('column1');
      wrapper
        .find({displayName: msg.dataVisualizerChartType()})
        .simulate('change', {target: {value: ChartType.HISTOGRAM}});
      expect(wrapper.instance().state.selectedColumn1).to.equal('');
      expect(wrapper.instance().state.selectedColumn2).to.equal('');
    });

    it('clears filter value when filter column changes', () => {
      let wrapper = shallow(<VisualizerModal {...DEFAULT_PROPS} />);
      wrapper.instance().setState({
        filterColumn: 'column',
        filterValue: 'value'
      });
      expect(wrapper.instance().state.filterValue).to.equal('value');
      wrapper
        .find({displayName: msg.filter()})
        .simulate('change', {target: {value: 'newColumn'}});
      expect(wrapper.instance().state.filterValue).to.equal('');
    });
  });

  describe('parseRecords', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = shallow(<VisualizerModal {...DEFAULT_PROPS} />);
      sinon.spy(wrapper.instance(), 'parseRecords');
    });

    it('ignores empty records', () => {
      let tableRecords = [];
      // tableRecords[0] is empty
      tableRecords[1] = '{"id":1,"name":"alice","age":7,"male":false}';
      tableRecords[2] = '{"id":2,"name":"bob","age":8,"male":true}';
      let expectedParsedRecords = [
        {id: 1, name: 'alice', age: 7, male: false},
        {id: 2, name: 'bob', age: 8, male: true}
      ];

      let parsedRecords = wrapper.instance().parseRecords(tableRecords);
      expect(parsedRecords).to.deep.equal(expectedParsedRecords);
    });
  });

  describe('filtering', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = mount(<VisualizerModal {...DEFAULT_PROPS} />);
      wrapper.instance().handleOpen();
    });

    it('finds all possible values in the filter column', () => {
      let records = [
        {id: 1, name: 'alice', age: 7, male: false},
        {id: 2, name: 'bob', age: 8, male: true},
        {id: 3, name: 'charlie', age: 9, male: true}
      ];
      expect(
        wrapper.instance().getValuesForFilterColumn(records, 'name')
      ).to.deep.equal(['alice', 'bob', 'charlie']);
      expect(
        wrapper.instance().getValuesForFilterColumn(records, 'age')
      ).to.deep.equal([7, 8, 9]);
      expect(
        wrapper.instance().getValuesForFilterColumn(records, 'male')
      ).to.deep.equal([false, true]);
    });

    it('sorts the filter values alphabetically or numerically', () => {
      let records = [
        {id: 2, name: 'bob', age: 8, male: true},
        {id: 3, name: 'charlie', age: 9, male: true},
        {id: 1, name: 'alice', age: 7, male: false}
      ];
      expect(
        wrapper.instance().getValuesForFilterColumn(records, 'name')
      ).to.deep.equal(['alice', 'bob', 'charlie']);
      expect(
        wrapper.instance().getValuesForFilterColumn(records, 'age')
      ).to.deep.equal([7, 8, 9]);
    });

    it('filters records by exact match', () => {
      let records = [
        {id: 1, name: 'alice', age: 8},
        {id: 2, name: 'charlie', age: 9},
        {id: 3, name: 'alex', age: 7},
        {id: 4, name: 'bob', age: 8},
        {id: 5, name: 'dan', age: 9},
        {id: 6, name: 'daniel', age: 8.5}
      ];
      expect(wrapper.instance().filterRecords(records, 'age', 8)).to.deep.equal(
        [{id: 1, name: 'alice', age: 8}, {id: 4, name: 'bob', age: 8}]
      );
      expect(
        wrapper.instance().filterRecords(records, 'name', 'dan')
      ).to.deep.equal([{id: 5, name: 'dan', age: 9}]);
    });

    it('passes filtered records to DataVisualizer if filter options are selected', () => {
      let spy = sinon.stub(GoogleChart.prototype, 'drawChart');
      GoogleChart.lib = {};
      wrapper.setProps({
        tableRecords: [
          '{"id": 1, "name": "alice", "age": 8}',
          '{"id": 2, "name": "charlie", "age": 9}',
          '{"id": 3, "name": "alex", "age": 7}',
          '{"id": 4, "name": "bob", "age": 8}',
          '{"id": 5, "name": "dan", "age": 9}',
          '{"id": 6, "name": "daniel", "age": 8.5}'
        ]
      });
      wrapper.setState({
        chartType: ChartType.BAR_CHART,
        selectedColumn1: 'name',
        filterColumn: 'age',
        filterValue: '8'
      });
      expect(wrapper.find(DataVisualizer).props().records).to.deep.equal([
        {id: 1, name: 'alice', age: 8},
        {id: 4, name: 'bob', age: 8}
      ]);
      spy.restore();
    });
  });

  describe('findNumericColumns', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = shallow(<VisualizerModal {...DEFAULT_PROPS} />);
      wrapper.instance().handleOpen();
    });

    it('finds the columns with all numeric values', () => {
      let columns = ['id', 'name', 'age', 'male'];
      let records = [
        {id: 1, name: 'alice', age: 7, male: false},
        {id: 2, name: 'bob', age: 8, male: true},
        {id: 3, name: 'charlie', age: 9, male: true}
      ];
      let expectedNumericColumns = ['id', 'age'];
      expect(
        wrapper.instance().findNumericColumns(records, columns)
      ).to.deep.equal(expectedNumericColumns);
    });

    it('ignores blank cells', () => {
      let columns = [
        'id',
        'numericWithBlank',
        'numericWithNull',
        'numericWithEmptyString'
      ];
      let records = [
        {
          id: 1,
          numericWithBlank: 1,
          numericWithNull: 2,
          numericWithEmptyString: 3
        },
        {id: 2, numericWithNull: null, numericWithEmptyString: ''},
        {
          id: 1,
          numericWithBlank: 4,
          numericWithNull: 5,
          numericWithEmptyString: 6
        }
      ];
      let expectedNumericColumns = [
        'id',
        'numericWithBlank',
        'numericWithNull',
        'numericWithEmptyString'
      ];
      expect(
        wrapper.instance().findNumericColumns(records, columns)
      ).to.deep.equal(expectedNumericColumns);
    });

    it('interprets columns with some numeric and some non-numeric values as non-numeric', () => {
      let columns = ['id', 'name', 'age', 'partially numeric'];
      let records = [
        {id: 1, name: 'alice', age: 7, 'partially numeric': 4},
        {id: 2, name: 'bob', 'partially numeric': 'not a number'},
        {id: 3, name: 'charlie', age: 9, 'partially numeric': 5}
      ];
      let expectedNumericColumns = ['id', 'age'];
      expect(
        wrapper.instance().findNumericColumns(records, columns)
      ).to.deep.equal(expectedNumericColumns);
    });
  });
});
