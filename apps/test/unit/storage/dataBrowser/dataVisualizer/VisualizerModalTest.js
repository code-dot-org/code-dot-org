import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../../util/reconfiguredChai';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import {ChartType} from '@cdo/apps/storage/dataBrowser/dataUtils';
import {
  UnconnectedVisualizerModal as VisualizerModal,
  OperatorType
} from '@cdo/apps/storage/dataBrowser/dataVisualizer/VisualizerModal';
import DropDownField from '@cdo/apps/storage/dataBrowser/dataVisualizer/DropdownField';

const DEFAULT_PROPS = {
  tableColumns: ['column1', 'column2'],
  tableName: 'testTable',
  tableRecords: [
    '{"column1":"a","column2":123}',
    '{"column1":"b","column2":456}',
    '{"column1":"3","column2":0}'
  ]
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

    it('shows numeric filters only for numeric columns', () => {
      let wrapper = shallow(<VisualizerModal {...DEFAULT_PROPS} />);
      wrapper.instance().setState({
        filterColumn: '',
        filterValue: ''
      });
      //non-numeric column should display only 4 dropdowns
      wrapper
        .find({displayName: 'Filter'})
        .simulate('change', {target: {value: 'column1'}});
      expect(wrapper.find(DropDownField)).to.have.lengthOf(4);
      //switch to numeric column, expect another dropdown
      wrapper
        .find({displayName: 'Filter'})
        .simulate('change', {target: {value: 'column2'}});
      expect(wrapper.find(DropDownField)).to.have.lengthOf(5);
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
      ).to.deep.equal(['123', '"456"', '"false"', 'true']);
    });

    it('shows null, undefined, and "" separately', () => {
      let records = [
        {id: 1, col: null},
        {id: 2, col: undefined},
        {id: 3, col: ''}
      ];
      expect(
        wrapper.instance().getValuesForFilterColumn(records, 'col')
      ).to.deep.equal(['""', 'null', 'undefined']);
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
      ).to.deep.equal(['"123"', '123', '"def"', 'true', '"xyz"', 'undefined']);
    });

    it('sorts numeric values', () => {
      let records = [
        {id: 1, col: 123},
        {id: 2, col: 32},
        {id: 3, col: 57},
        {id: 4, col: 0},
        {id: 5, col: -10}
      ];

      expect(
        wrapper
          .instance()
          .getValuesForFilterColumn(records, 'col', true /* isNumeric */)
      ).to.deep.equal(['-10', '0', '32', '57', '123']);
    });
  });

  describe('filterRecords', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = shallow(<VisualizerModal {...DEFAULT_PROPS} />);
    });
    it('works with numbers', () => {
      let records = [
        {id: 1, filterCol: 123, chartCol: 2},
        {id: 2, filterCol: 456, chartCol: 3},
        {id: 3, filterCol: 123, chartCol: 5},
        {id: 4, filterCol: '456', chartCol: 7},
        {id: 5, filterCol: 0, chartCol: 5}
      ];
      expect(
        wrapper.instance().filterRecords(records, 'filterCol', '123')
      ).to.deep.equal([records[0], records[2]]);

      expect(
        wrapper.instance().filterRecords(records, 'filterCol', '456')
      ).to.deep.equal([records[1]]);

      expect(
        wrapper.instance().filterRecords(records, 'filterCol', '0')
      ).to.deep.equal([records[4]]);
    });
    it('operators work with numbers', () => {
      let records = [
        {id: 1, filterCol: 123, chartCol: 2},
        {id: 2, filterCol: 456, chartCol: 3},
        {id: 3, filterCol: 123, chartCol: 5},
        {id: 4, filterCol: 0, chartCol: 5}
      ];
      expect(
        wrapper
          .instance()
          .filterRecords(records, 'filterCol', '123', OperatorType.GREATER_THAN)
      ).to.deep.equal([records[1]]);

      expect(
        wrapper
          .instance()
          .filterRecords(records, 'filterCol', '456', OperatorType.LESS_THAN)
      ).to.deep.equal([records[0], records[2], records[3]]);

      expect(
        wrapper
          .instance()
          .filterRecords(
            records,
            'filterCol',
            '456',
            OperatorType.LESS_THAN_OR_EQUAL
          )
      ).to.deep.equal([records[0], records[1], records[2], records[3]]);

      expect(
        wrapper
          .instance()
          .filterRecords(
            records,
            'filterCol',
            '123',
            OperatorType.GREATER_THAN_OR_EQUAL
          )
      ).to.deep.equal([records[0], records[1], records[2]]);
    });
    it('works with booleans', () => {
      let records = [
        {id: 1, filterCol: true, chartCol: 2},
        {id: 2, filterCol: false, chartCol: 3},
        {id: 3, filterCol: true, chartCol: 5},
        {id: 4, filterCol: 'false', chartCol: 7}
      ];
      expect(
        wrapper.instance().filterRecords(records, 'filterCol', 'true')
      ).to.deep.equal([records[0], records[2]]);

      expect(
        wrapper.instance().filterRecords(records, 'filterCol', 'false')
      ).to.deep.equal([records[1]]);
    });

    it('works with null', () => {
      let records = [
        {id: 1, filterCol: null, chartCol: 2},
        {id: 2, filterCol: false, chartCol: 3},
        {id: 3, filterCol: 0, chartCol: 5},
        {id: 4, filterCol: null, chartCol: 7}
      ];

      expect(
        wrapper.instance().filterRecords(records, 'filterCol', 'null')
      ).to.deep.equal([records[0], records[3]]);
    });

    it('works with undefined', () => {
      let records = [
        {id: 1, chartCol: 2},
        {id: 2, filterCol: undefined, chartCol: 3},
        {id: 3, filterCol: 0, chartCol: 5},
        {id: 4, filterCol: null, chartCol: 7}
      ];

      expect(
        wrapper.instance().filterRecords(records, 'filterCol', 'undefined')
      ).to.deep.equal([records[0], records[1]]);
    });

    describe('filtering with strings', () => {
      it('works by exact match only', () => {
        let records = [
          {id: 1, filterCol: 'part', chartCol: 3},
          {id: 2, filterCol: 'par', chartCol: 3},
          {id: 3, filterCol: 'part', chartCol: 5},
          {id: 4, filterCol: 'partial', chartCol: 7}
        ];

        expect(
          wrapper.instance().filterRecords(records, 'filterCol', '"part"')
        ).to.deep.equal([records[0], records[2]]);
      });

      it('works with empty string', () => {
        let records = [
          {id: 1, filterCol: '', chartCol: 3},
          {id: 2, filterCol: 'a', chartCol: 3},
          {id: 3, filterCol: 'b', chartCol: 5},
          {id: 4, filterCol: '', chartCol: 7}
        ];

        expect(
          wrapper.instance().filterRecords(records, 'filterCol', '""')
        ).to.deep.equal([records[0], records[3]]);
      });

      it('works with strings that contain quotes', () => {
        let records = [
          {id: 1, filterCol: '"hello", he said', chartCol: 3},
          {id: 2, filterCol: "'single quoted string'", chartCol: 3},
          {id: 3, filterCol: "it's a contraction", chartCol: 5},
          {id: 4, filterCol: '"hello", he said', chartCol: 'a'},
          {id: 5, filterCol: "'single quoted string'", chartCol: 'b'},
          {id: 6, filterCol: "it's a contraction", chartCol: 'c'}
        ];

        expect(
          wrapper
            .instance()
            .filterRecords(records, 'filterCol', `'"hello", he said'`)
        ).to.deep.equal([records[0], records[3]]);
        expect(
          wrapper
            .instance()
            .filterRecords(records, 'filterCol', `"'single quoted string'"`)
        ).to.deep.equal([records[1], records[4]]);
        expect(
          wrapper
            .instance()
            .filterRecords(records, 'filterCol', `"it's a contraction"`)
        ).to.deep.equal([records[2], records[5]]);
      });
    });
  });

  describe('chartOptionsToString', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = shallow(<VisualizerModal {...DEFAULT_PROPS} />);
      wrapper.instance().setState({
        selectedColumn1: 'column1',
        selectedColumn2: 'column2',
        bucketSize: '2'
      });
    });
    it('works for bar charts', () => {
      expect(
        wrapper.instance().chartOptionsToString(ChartType.BAR_CHART)
      ).to.equal('Values: column1');
    });
    it('works for histograms', () => {
      expect(
        wrapper.instance().chartOptionsToString(ChartType.HISTOGRAM)
      ).to.equal('Values: column1, Bucket Size: 2');
    });
    it('works for scatter plots', () => {
      expect(
        wrapper.instance().chartOptionsToString(ChartType.SCATTER_PLOT)
      ).to.equal('X Values: column1, Y Values: column2');
    });
    it('works for cross tab charts', () => {
      expect(
        wrapper.instance().chartOptionsToString(ChartType.CROSS_TAB)
      ).to.equal('X Values: column1, Y Values: column2');
    });
    it('works for filtering', () => {
      wrapper.instance().setState({
        filterColumn: 'column3',
        filterValue: 'value'
      });
      expect(
        wrapper.instance().chartOptionsToString(ChartType.BAR_CHART)
      ).to.equal('Values: column1, Filtered column3 to value');
    });
  });
});
