import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import RubricFloatingActionButton from '@cdo/apps/templates/rubrics/RubricFloatingActionButton';

describe('RubricFloatingActionButton', () => {
  it('begins closed', () => {
    const wrapper = shallow(<RubricFloatingActionButton />);
    expect(wrapper.find('RubricContainer').length).to.equal(0);
  });

  it('opens RubricContainer when clicked', () => {
    const wrapper = shallow(<RubricFloatingActionButton />);
    expect(wrapper.find('button').length).to.equal(1);
    wrapper.find('button').simulate('click');
    expect(wrapper.find('RubricContainer').length).to.equal(1);
  });
});
