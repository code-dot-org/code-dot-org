import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../util/reconfiguredChai';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import GoogleChart from '@cdo/apps/applab/GoogleChart';
import {UnconnectedDataVisualizer as DataVisualizer} from '@cdo/apps/storage/dataBrowser/DataVisualizer';

const DEFAULT_PROPS = {
  tableColumns: [],
  tableName: 'testTable',
  tableRecords: []
};

describe('DataVisualizer', () => {
  var wrapper;

  it('The modal starts closed', () => {
    wrapper = shallow(<DataVisualizer {...DEFAULT_PROPS} />);
    expect(wrapper.find(BaseDialog).prop('isOpen')).to.be.false;
  });

  it('The modal opens when the button is clicked', () => {
    wrapper = shallow(<DataVisualizer {...DEFAULT_PROPS} />);
    expect(wrapper.find(BaseDialog).prop('isOpen')).to.be.false;

    wrapper.instance().handleOpen();
    expect(wrapper.find(BaseDialog).prop('isOpen')).to.be.true;
  });

  describe('updateChart', () => {
    let wrapper;
    let spy;
    beforeEach(() => {
      GoogleChart.lib = {};
      spy = sinon.stub(GoogleChart.prototype, 'drawChart');
      const STARTING_PROPS = {
        tableColumns: ['category1', 'category2'],
        tableName: 'testTable',
        tableRecords: [
          '{"category1" : "red", "category2": 1, "category3": 10}',
          '{"category1" : "blue", "category2": 1, "category3": 20}',
          '{"category1" : "red", "category2": 3, "category3": 10}',
          '{"category1" : "green", "category2": 4, "category3": 10}'
        ]
      };
      wrapper = shallow(<DataVisualizer {...STARTING_PROPS} />);
      wrapper.instance().handleOpen();
      var chartArea = document.createElement('div');
      chartArea.setAttribute('id', 'chart-area');
      document.body.appendChild(chartArea);
    });

    afterEach(() => spy.restore());

    it('can show a scatter plot', () => {
      const expectedChartData = [
        {category1: 'red', category2: 1, category3: 10},
        {category1: 'blue', category2: 1, category3: 20},
        {category1: 'red', category2: 3, category3: 10},
        {category1: 'green', category2: 4, category3: 10}
      ];
      wrapper.instance().setState({
        chartType: 'Scatter Plot',
        xValues: 'category2',
        yValues: 'category3'
      });
      expect(spy).to.have.been.calledOnce;
      expect(spy.getCalls()[0].args).to.deep.equal([
        expectedChartData,
        ['category2', 'category3'],
        {}
      ]);
    });
  });

  describe('parseRecords', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = shallow(<DataVisualizer {...DEFAULT_PROPS} />);
      sinon.spy(wrapper.instance(), 'parseRecords');
    });

    it('parses records immediately when the visualizer opens', () => {
      expect(wrapper.instance().parseRecords).not.toHaveBeenCalled;
      wrapper.instance().handleOpen();
      expect(wrapper.instance().parseRecords).to.have.been.calledOnce;
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

      wrapper.setProps({tableRecords: tableRecords});
      wrapper.instance().handleOpen();
      expect(wrapper.instance().state.parsedRecords).to.deep.equal(
        expectedParsedRecords
      );
      expect(wrapper.instance().parseRecords).to.have.been.calledOnce;
    });

    it('Only reparses records when they change', () => {
      let expectedParsedRecords = [
        {id: 1, name: 'alice', age: 7, male: false},
        {id: 2, name: 'bob', age: 8, male: true},
        {id: 3, name: 'charlie', age: 9, male: true}
      ];
      // Setting new records will cause them to be parsed
      wrapper.setProps({
        tableRecords: [
          '{"id":1,"name":"alice","age":7,"male":false}',
          '{"id":2,"name":"bob","age":8,"male":true}',
          '{"id":3,"name":"charlie","age":9,"male":true}'
        ]
      });
      wrapper.instance().handleOpen();
      expect(wrapper.instance().state.parsedRecords).to.deep.equal(
        expectedParsedRecords
      );
      expect(wrapper.instance().parseRecords).to.have.been.calledOnce;

      // Updating state but not records does not cause records to be re-parsed
      wrapper.instance().setState({chartType: 'Bar Chart'});
      expect(wrapper.instance().parseRecords).to.have.been.calledOnce;

      // Updating records causes them to be re-parsed
      wrapper.setProps({
        tableRecords: [
          '{"id":1,"name":"alice","age":7,"male":false}',
          '{"id":2,"name":"bob","age":8,"male":true}',
          '{"id":3,"name":"charlie","age":9,"male":true}',
          '{"id":4,"name":"dana","age":10,"male":false}'
        ]
      });
      expectedParsedRecords.push({id: 4, name: 'dana', age: 10, male: false});
      expect(wrapper.instance().state.parsedRecords).to.deep.equal(
        expectedParsedRecords
      );
      expect(wrapper.instance().parseRecords).to.have.been.calledTwice;
    });
  });

  describe('findNumericColumns', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = shallow(<DataVisualizer {...DEFAULT_PROPS} />);
      wrapper.instance().handleOpen();
    });

    it('finds the columns with all numeric values', () => {
      wrapper.setProps({
        tableColumns: ['id', 'name', 'age', 'male'],
        tableRecords: [
          '{"id":1,"name":"alice","age":7,"male":false}',
          '{"id":2,"name":"bob","age":8,"male":true}',
          '{"id":3,"name":"charlie","age":9,"male":true}'
        ]
      });
      let expectedNumericColumns = ['id', 'age'];
      expect(wrapper.instance().state.numericColumns).to.deep.equal(
        expectedNumericColumns
      );
    });

    it('ignores blank cells', () => {
      wrapper.setProps({
        tableColumns: ['id', 'name', 'age', 'male'],
        tableRecords: [
          '{"id":1,"name":"alice","age":7,"male":"false"}',
          '{"id":2,"name":"bob","male":"true"}',
          '{"id":3,"name":"charlie","age":9,"male":"true"}'
        ]
      });
      let expectedNumericColumns = ['id', 'age'];
      expect(wrapper.instance().state.numericColumns).to.deep.equal(
        expectedNumericColumns
      );
    });

    it('interprets columns with some numeric and some non-numeric values as non-numeric', () => {
      wrapper.setProps({
        tableColumns: ['id', 'name', 'age', 'partially numeric'],
        tableRecords: [
          '{"id":1,"name":"alice","age":7,"partially numeric":4}',
          '{"id":2,"name":"bob","partially numeric":"not a number"}',
          '{"id":3,"name":"charlie","age":9,"partially numeric":5}'
        ]
      });
      let expectedNumericColumns = ['id', 'age'];
      expect(wrapper.instance().state.numericColumns).to.deep.equal(
        expectedNumericColumns
      );
    });
  });
});
