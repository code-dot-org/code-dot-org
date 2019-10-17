import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import {UnconnectedDataVisualizer as DataVisualizer} from '@cdo/apps/storage/dataBrowser/DataVisualizer';

const DEFAULT_PROPS = {
  tableColumns: ['Name', 'Age', 'Male'],
  tableName: 'testTable',
  tableRecords: [
    '{"id":1,"name":"alice","age":7,"male":false}',
    '{"id":2,"name":"bob","age":8,"male":true}',
    '{"id":3,"name":"charlie","age":9,"male":true}'
  ]
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

    wrapper.find('button').simulate('click');
    expect(wrapper.find(BaseDialog).prop('isOpen')).to.be.true;
  });
});
