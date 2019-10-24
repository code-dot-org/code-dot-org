import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../util/reconfiguredChai';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import {UnconnectedDataVisualizer as DataVisualizer} from '@cdo/apps/storage/dataBrowser/DataVisualizer';

const DEFAULT_PROPS = {
  tableColumns: ['Name', 'Age', 'Male'],
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

  describe('parseRecords', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = shallow(<DataVisualizer {...DEFAULT_PROPS} />);
      sinon.spy(wrapper.instance(), 'parseRecords');
      wrapper.instance().handleOpen();
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
});
