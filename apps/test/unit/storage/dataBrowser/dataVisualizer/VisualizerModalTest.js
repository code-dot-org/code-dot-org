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
});
