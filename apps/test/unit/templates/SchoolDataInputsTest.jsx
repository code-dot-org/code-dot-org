import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/deprecatedChai';
import SchoolDataInputs from '@cdo/apps/templates/SchoolDataInputs';

describe('SchoolDataInputs', () => {
  it('shallow-renders', () => {
    const wrapper = shallow(<SchoolDataInputs />);
    expect(wrapper).not.to.be.null;
  });
});
