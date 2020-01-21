import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../../util/reconfiguredChai';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import {UnconnectedVisualizerModal as VisualizerModal} from '@cdo/apps/storage/dataBrowser/dataVisualizer/VisualizerModal';

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
        chartType: 'Scatter Plot',
        selectedColumn1: 'column1',
        selectedColumn2: 'column2'
      });
      expect(wrapper.instance().state.selectedColumn1).to.equal('column1');
      wrapper
        .find({displayName: 'Chart Type'})
        .simulate('change', {target: {value: 'Histogram'}});
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
        .find({displayName: 'Filter'})
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

  describe('getValuesForFilterColumn', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = shallow(<VisualizerModal {...DEFAULT_PROPS} />);
    });

    it('shows quotes around strings', () => {
      let records = [{id: 3, col: '123'}, {id: 4, col: 'abc'}];
      expect(
        wrapper.instance().getValuesForFilterColumn(records, 'col')
      ).to.deep.equal(['"123"', '"abc"']);
    });

    it('shows numbers and booleans without quotes', () => {
      let records = [
        {id: 1, col: true},
        {id: 2, col: 'false'},
        {id: 3, col: 123},
        {id: 4, col: '456'}
      ];
      expect(
        wrapper.instance().getValuesForFilterColumn(records, 'col')
      ).to.deep.equal(['true', '"false"', '123', '"456"']);
    });

    it('shows null, undefined, and "" separately', () => {
      let records = [
        {id: 1, col: null},
        {id: 2, col: undefined},
        {id: 3, col: ''}
      ];
      expect(
        wrapper.instance().getValuesForFilterColumn(records, 'col')
      ).to.deep.equal(['null', 'undefined', '""']);
    });

    it('returns a list of unique values in the column', () => {
      let records = [
        {id: 1, col: 'xyz'},
        {id: 2, col: 'def'},
        {id: 3, col: '123'},
        {id: 4, col: 'xyz'}, // duplicate 'xyz'
        {id: 5, col: undefined},
        {id: 6}, // duplicate undefined
        {id: 7, col: 123}, // not a duplicate because this is a number and above is a string
        {id: 8, col: true},
        {id: 9, col: true} // duplicate true
      ];

      expect(
        wrapper.instance().getValuesForFilterColumn(records, 'col')
      ).to.deep.equal(['"xyz"', '"def"', '"123"', 'undefined', '123', 'true']);
    });
  });
});
